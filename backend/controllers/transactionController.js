const Transaction = require("../models/Transaction");
const { emitToUser } = require("../sockets");
const { checkBudgetAlert } = require("../utils/budgetAlert");

// GET /api/transactions?type=&category=&from=&to=&search=&page=&limit=
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, from, to, search, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, note, date, receiptUrl, source } = req.body;
    if (!type || !amount || !category) {
      return res.status(400).json({ message: "type, amount and category are required" });
    }
    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      note,
      date: date || Date.now(),
      receiptUrl,
      source: source || "manual",
    });

    emitToUser(req.user._id, "transaction:created", { transaction });
    if (type === "expense") await checkBudgetAlert(req.user);

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const fields = ["type", "amount", "category", "note", "date", "receiptUrl"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) transaction[f] = req.body[f];
    });

    await transaction.save();

    emitToUser(req.user._id, "transaction:updated", { transaction });
    if (transaction.type === "expense") await checkBudgetAlert(req.user);

    res.json({ transaction });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    emitToUser(req.user._id, "transaction:deleted", { id: transaction._id });

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
