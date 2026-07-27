const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { answerFinanceQueryStream } = require("../utils/gemini");
const { buildChatContext } = require("../utils/chatContext");

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
