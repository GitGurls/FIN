const Investment = require("../models/Investment");

// GET /api/investments
const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
    const gainLoss = totalCurrent - totalInvested;
    const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

    res.json({
      investments,
      summary: { totalInvested, totalCurrent, gainLoss, gainLossPct },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/investments
const createInvestment = async (req, res, next) => {
  try {
    const { name, type, investedAmount, currentValue, purchaseDate, notes } = req.body;
    if (!name || investedAmount === undefined || currentValue === undefined) {
      return res.status(400).json({ message: "name, investedAmount and currentValue are required" });
    }
    const investment = await Investment.create({
      user: req.user._id,
      name,
      type,
      investedAmount,
      currentValue,
      purchaseDate,
      notes,
    });
    res.status(201).json({ investment });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/investments/:id
const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });
    if (!investment) return res.status(404).json({ message: "Investment not found" });

    const fields = ["name", "type", "investedAmount", "currentValue", "purchaseDate", "notes"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) investment[f] = req.body[f];
    });
    await investment.save();
    res.json({ investment });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/investments/:id
const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!investment) return res.status(404).json({ message: "Investment not found" });
    res.json({ message: "Investment deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInvestments, createInvestment, updateInvestment, deleteInvestment };
