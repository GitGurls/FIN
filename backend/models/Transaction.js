const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, required: true, default: Date.now },
    receiptUrl: { type: String, default: "" },
    source: { type: String, enum: ["manual", "receipt_ocr", "voice"], default: "manual" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null, index: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
