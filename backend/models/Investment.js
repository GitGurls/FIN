const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["stocks", "mutual_fund", "crypto", "gold", "fd", "real_estate", "other"],
      default: "other",
    },
    investedAmount: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
