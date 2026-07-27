const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    color: { type: String, default: "#6EE7B7" },
    icon: { type: String, default: "wallet" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
