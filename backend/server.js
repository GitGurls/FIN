require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./sockets");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const chatRoutes = require("./routes/chatRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const groupRoutes = require("./routes/groupRoutes");

connectDB();

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "FinPilot AI backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/groups", groupRoutes);

app.use(notFound);
app.use(errorHandler);

initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`FinPilot AI backend + WebSocket running on port ${PORT}`));
