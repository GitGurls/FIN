const Group = require("../models/Group");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { computeSettlements } = require("../utils/settlement");
const { emitToUser } = require("../sockets");

const requireMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId).populate("members.user", "name email avatarUrl");
  if (!group) return { error: { status: 404, message: "Group not found" } };
  if (!group.isMember(userId)) return { error: { status: 403, message: "Not a member of this group" } };
  return { group };
};

// POST /api/groups  { name, type: "family" | "trip" }
const createGroup = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const group = await Group.create({
      name,
      type: type === "trip" ? "trip" : "family",
      owner: req.user._id,
      currency: req.user.currency,
      members: [{ user: req.user._id, role: "owner" }],
    });

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ "members.user": req.user._id })
      .populate("members.user", "name email avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id
const getGroup = async (req, res, next) => {
  try {
    const { error, group } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });
    res.json({ group });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/invite  { email }
const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const { error, group } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const invitee = await User.findOne({ email: email.toLowerCase() });
    if (!invitee) {
      return res.status(404).json({ message: "No FinPilot account found with that email" });
    }
    if (group.isMember(invitee._id)) {
      return res.status(409).json({ message: "This person is already in the group" });
    }

    group.members.push({ user: invitee._id, role: "member" });
    await group.save();
    await group.populate("members.user", "name email avatarUrl");

    emitToUser(invitee._id, "group:invited", { group });
    res.json({ group });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id/leave
const leaveGroup = async (req, res, next) => {
  try {
    const { error, group } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "The owner can't leave — delete the group instead if you want to disband it",
      });
    }

    group.members = group.members.filter((m) => m.user._id.toString() !== req.user._id.toString());
    await group.save();
    res.json({ message: "Left the group" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this group" });
    }
    await Transaction.deleteMany({ group: group._id });
    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id/transactions
const getGroupTransactions = async (req, res, next) => {
  try {
    const { error } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const transactions = await Transaction.find({ group: req.params.id })
      .populate("paidBy", "name email")
      .sort({ date: -1 });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/transactions  { amount, category, note, date, splitAmong? }
const createGroupTransaction = async (req, res, next) => {
  try {
    const { error, group } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { amount, category, note, date, splitAmong } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: "amount and category are required" });
    }

    const memberIds = group.members.map((m) => m.user._id.toString());
    const split =
      Array.isArray(splitAmong) && splitAmong.length
        ? splitAmong.filter((id) => memberIds.includes(id))
        : memberIds;

    const transaction = await Transaction.create({
      user: req.user._id,
      type: "expense",
      amount,
      category,
      note,
      date: date || Date.now(),
      source: "manual",
      group: group._id,
      paidBy: req.user._id,
      splitAmong: split,
    });

    // Live-update every group member's device.
    memberIds.forEach((id) => emitToUser(id, "group:transaction:created", { groupId: group._id, transaction }));

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id/dashboard — per-member balances + suggested settlements
const getGroupDashboard = async (req, res, next) => {
  try {
    const { error, group } = await requireMembership(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const transactions = await Transaction.find({ group: group._id });

    const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
    const balances = {};
    group.members.forEach((m) => {
      balances[m.user._id.toString()] = 0;
    });

    transactions.forEach((t) => {
      const payer = t.paidBy?.toString();
      const splitters = t.splitAmong.length ? t.splitAmong.map((id) => id.toString()) : Object.keys(balances);
      const share = t.amount / splitters.length;

      if (payer && balances[payer] !== undefined) balances[payer] += t.amount;
      splitters.forEach((id) => {
        if (balances[id] !== undefined) balances[id] -= share;
      });
    });

    const settlements = computeSettlements(balances);
    const memberBalances = group.members.map((m) => ({
      user: { id: m.user._id, name: m.user.name, email: m.user.email },
      balance: Math.round((balances[m.user._id.toString()] || 0) * 100) / 100,
    }));

    res.json({
      totalSpent,
      currency: group.currency,
      memberBalances,
      settlements: settlements.map((s) => ({
        from: group.members.find((m) => m.user._id.toString() === s.from)?.user.name || s.from,
        to: group.members.find((m) => m.user._id.toString() === s.to)?.user.name || s.to,
        amount: s.amount,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  inviteMember,
  leaveGroup,
  deleteGroup,
  getGroupTransactions,
  createGroupTransaction,
  getGroupDashboard,
};
