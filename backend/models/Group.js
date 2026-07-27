const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["family", "trip"], default: "family" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "member"], default: "member" },
      },
    ],
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

groupSchema.methods.isMember = function (userId) {
  return this.members.some((m) => {
    const memberId = m.user && m.user._id ? m.user._id : m.user;
    return memberId?.toString() === userId?.toString();
  });
};

module.exports = mongoose.model("Group", groupSchema);
