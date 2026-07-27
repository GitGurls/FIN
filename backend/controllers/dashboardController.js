const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { generateInsight, explainHealthScore, generateMonthlyReport } = require("../utils/gemini");
const { computeHealthScore } = require("../utils/healthScore");

// GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;
    const netWorth = income - expense;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTotals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const monthIncome = monthTotals.find((t) => t._id === "income")?.total || 0;
    const monthExpense = monthTotals.find((t) => t._id === "expense")?.total || 0;

    res.json({
      netWorth,
      totalIncome: income,
      totalExpense: expense,
      monthIncome,
      monthExpense,
      monthlyBudget: req.user.monthlyBudget,
      budgetRemaining: Math.max(req.user.monthlyBudget - monthExpense, 0),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/monthly-trend?months=6
const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const buckets = {};
    data.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      buckets[key] = buckets[key] || { month: key, income: 0, expense: 0 };
      buckets[key][d._id.type] = d.total;
    });

    res.json({ trend: Object.values(buckets) });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/by-category?type=expense
const getByCategory = async (req, res, next) => {
  try {
    const type = req.query.type === "income" ? "income" : "expense";
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, type, date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ categories: data.map((d) => ({ category: d._id, total: d.total, count: d.count })) });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/heatmap?year=2026
const getHeatmap = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, type: "expense", date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({ heatmap: data.map((d) => ({ date: d._id, total: d.total })) });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/ai-insight
const getAiInsight = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const byCategory = await Transaction.aggregate([
      { $match: { user: userId, type: "expense", date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const totals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;

    const summaryText = `Currency: ${req.user.currency}. Monthly budget: ${req.user.monthlyBudget}.
This month's income: ${income}. This month's expense: ${expense}.
Top spending categories: ${byCategory.map((c) => `${c._id}: ${c.total}`).join(", ") || "none yet"}.`;

    const insight = await generateInsight(summaryText);
    res.json({ insight });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/health-score
const getHealthScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthTotals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const monthIncome = monthTotals.find((t) => t._id === "income")?.total || 0;
    const monthExpense = monthTotals.find((t) => t._id === "expense")?.total || 0;

    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const trendData = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const buckets = {};
    trendData.forEach((d) => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
      buckets[key] = buckets[key] || { month: key, income: 0, expense: 0 };
      buckets[key][d._id.type] = d.total;
    });
    const monthlyTrend = Object.values(buckets);

    const score = computeHealthScore({
      monthlyBudget: req.user.monthlyBudget,
      monthIncome,
      monthExpense,
      monthlyTrend,
    });

    let explanation = "";
    try {
      explanation = await explainHealthScore(score);
    } catch {
      explanation = "Add more transactions to unlock a personalized breakdown.";
    }

    res.json({ ...score, explanation });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/monthly-report?month=2026-07
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [year, month] = (req.query.month || "").split("-").map(Number);
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month ? month - 1 : now.getMonth();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 1);

    const [totals, byCategory, count] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: start, $lt: end } } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: "expense", date: { $gte: start, $lt: end } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.countDocuments({ user: userId, date: { $gte: start, $lt: end } }),
    ]);

    const income = totals.find((t) => t._id === "income")?.total || 0;
    const expense = totals.find((t) => t._id === "expense")?.total || 0;

    const statsContext = {
      month: `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`,
      currency: req.user.currency,
      monthlyBudget: req.user.monthlyBudget,
      income,
      expense,
      savings: income - expense,
      transactionCount: count,
      topCategories: byCategory.slice(0, 5).map((c) => ({ category: c._id, total: c.total })),
    };

    let narrative = "";
    try {
      narrative = await generateMonthlyReport(statsContext);
    } catch {
      narrative = "Report narrative unavailable right now — the stats below are still accurate.";
    }

    res.json({ stats: statsContext, narrative });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getMonthlyTrend,
  getByCategory,
  getHeatmap,
  getAiInsight,
  getHealthScore,
  getMonthlyReport,
};
