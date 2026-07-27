const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    monthlyBudget: { type: Number, default: 0 },
    lastBudgetAlertMonth: { type: String, default: "" }, // e.g. "2026-07"
    lastBudgetAlertLevel: { type: Number, default: 0 }, // 0, 90, or 100
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    currency: this.currency,
    monthlyBudget: this.monthlyBudget,
  };
};

module.exports = mongoose.model("User", userSchema);
