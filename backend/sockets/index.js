const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const { answerFinanceQueryStream, detectAndParseTransactions } = require("../utils/gemini");
const { buildChatContext } = require("../utils/chatContext");
const { checkBudgetAlert } = require("../utils/budgetAlert");

let ioInstance = null;

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  // Auth every socket connection with the same JWT used for REST calls.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No auth token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User no longer exists"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Every device/tab this user opens joins the same room -> instant multi-device sync.
    const room = `user:${socket.user._id}`;
    socket.join(room);

    socket.on("chat:message", async ({ message }) => {
      if (!message?.trim()) return;
      try {
        const categories = await Category.find({ user: socket.user._id }).select("name -_id");
        const categoryNames = categories.map((c) => c.name);

        const { isLogging, transactions } = await detectAndParseTransactions(message, categoryNames);

        if (isLogging) {
          // Don't save yet — let the user review/edit and confirm from the chat UI first.
          socket.emit("chat:transactions-suggested", { transactions });
          return;
        }

        const dataContext = await buildChatContext(socket.user);
        let full = "";
        await answerFinanceQueryStream(message, dataContext, (chunk) => {
          full += chunk;
          socket.emit("chat:chunk", { chunk });
        });
        socket.emit("chat:done", { answer: full });
      } catch (err) {
        console.error("[chat:message] AI copilot error:", err.message || err);
        socket.emit("chat:error", { message: "AI copilot is unavailable right now." });
      }
    });

    // User reviewed the AI-suggested transactions (from a chat message) and confirmed them.
    socket.on("chat:confirm-transactions", async ({ transactions }) => {
      try {
        if (!Array.isArray(transactions) || transactions.length === 0) return;

        const created = await Transaction.insertMany(
          transactions.map((t) => ({
            user: socket.user._id,
            type: t.type === "income" ? "income" : "expense",
            amount: Number(t.amount) || 0,
            category: t.category || "Other",
            note: t.note || "",
            date: Date.now(),
            source: "manual",
          }))
        );

        created.forEach((transaction) => {
          emitToUser(socket.user._id, "transaction:created", { transaction });
        });

        const hasExpense = created.some((t) => t.type === "expense");
        if (hasExpense) await checkBudgetAlert(socket.user);

        socket.emit("chat:transactions-saved", { count: created.length });
      } catch (err) {
        console.error("[chat:confirm-transactions] error:", err.message || err);
        socket.emit("chat:error", { message: "Couldn't save those transactions — try again." });
      }
    });

    socket.on("disconnect", () => {
      // no-op for now; room membership is cleaned up automatically by socket.io
    });
  });

  ioInstance = io;
  return io;
};

/** Emit an event to every device/tab this user has open. */
const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };