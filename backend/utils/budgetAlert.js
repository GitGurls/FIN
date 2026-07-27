const Transaction = require("../models/Transaction");
const { emitToUser } = require("../sockets");

/**
 * After an expense is created/updated, checks whether the user's monthly budget
 * threshold (90% or 100%) has just been crossed, and emits a notification once
 * per threshold per month (tracked on the user document to avoid repeat spam).
 */
const checkBudgetAlert = async (user) => {
  if (!user.monthlyBudget || user.monthlyBudget <= 0) return;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await Transaction.aggregate([
    { $match: { user: user._id, type: "expense", date: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const monthExpense = result[0]?.total || 0;
  const ratio = monthExpense / user.monthlyBudget;

  let level = 0;
  if (ratio >= 1) level = 100;
  else if (ratio >= 0.9) level = 90;
  if (level === 0) return;

  const alreadyAlerted = user.lastBudgetAlertMonth === monthKey && user.lastBudgetAlertLevel >= level;
  if (alreadyAlerted) return;

  user.lastBudgetAlertMonth = monthKey;
  user.lastBudgetAlertLevel = level;
  await user.save();

  emitToUser(user._id, "notification", {
    type: level >= 100 ? "budget_exceeded" : "budget_warning",
    title: level >= 100 ? "Budget crossed" : "90% of budget used",
    message:
      level >= 100
        ? `You've spent ${monthExpense.toLocaleString()} — over your ${user.monthlyBudget.toLocaleString()} monthly budget.`
        : `You've used 90% of your ${user.monthlyBudget.toLocaleString()} monthly budget.`,
  });
};

module.exports = { checkBudgetAlert };
