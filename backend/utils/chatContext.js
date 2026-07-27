const Transaction = require("../models/Transaction");

/** Builds the real-data context passed to the AI so it can't hallucinate numbers. */
const buildChatContext = async (user) => {
  const userId = user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonthByCategory, lastMonthByCategory, totals, recent] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, type: "expense", date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: startOfLastMonth, $lt: startOfMonth },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Transaction.find({ user: userId }).sort({ date: -1 }).limit(15).select("-user -__v"),
  ]);

  return {
    currency: user.currency,
    monthlyBudget: user.monthlyBudget,
    allTimeIncome: totals.find((t) => t._id === "income")?.total || 0,
    allTimeExpense: totals.find((t) => t._id === "expense")?.total || 0,
    thisMonthByCategory: thisMonthByCategory.map((c) => ({ category: c._id, total: c.total })),
    lastMonthByCategory: lastMonthByCategory.map((c) => ({ category: c._id, total: c.total })),
    recentTransactions: recent.map((t) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date.toISOString().slice(0, 10),
      note: t.note,
    })),
  };
};

module.exports = { buildChatContext };
