/**
 * Computes a 0-100 "Financial Health Score" from real transaction aggregates.
 * Deterministic and explainable — the AI only narrates it, never invents the number.
 *
 * Sub-scores (each 0-100):
 *  - savingsRate: (income - expense) / income, scaled
 *  - budgetAdherence: how close monthly expense is to the user's set budget
 *  - consistency: inverse of month-to-month expense volatility (coefficient of variation)
 */
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const computeHealthScore = ({ monthlyBudget, monthIncome, monthExpense, monthlyTrend }) => {
  // Savings rate sub-score
  let savingsRate = 0;
  if (monthIncome > 0) {
    const rate = (monthIncome - monthExpense) / monthIncome; // can be negative
    savingsRate = clamp(50 + rate * 100); // 0% savings -> 50, 50% savings -> 100, negative -> below 50
  }

  // Budget adherence sub-score
  let budgetAdherence = 70; // neutral default if no budget set
  if (monthlyBudget > 0) {
    const ratio = monthExpense / monthlyBudget;
    if (ratio <= 1) budgetAdherence = clamp(100 - ratio * 20); // under budget: 80-100
    else budgetAdherence = clamp(80 - (ratio - 1) * 100); // over budget: drops fast
  }

  // Consistency sub-score (based on expense volatility across recent months)
  let consistency = 70;
  const expenses = (monthlyTrend || []).map((m) => m.expense || 0).filter((v) => v > 0);
  if (expenses.length >= 2) {
    const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const variance = expenses.reduce((a, b) => a + (b - mean) ** 2, 0) / expenses.length;
    const stdDev = Math.sqrt(variance);
    const coefVar = mean > 0 ? stdDev / mean : 0;
    consistency = clamp(100 - coefVar * 100);
  }

  const overall = Math.round(savingsRate * 0.45 + budgetAdherence * 0.35 + consistency * 0.2);

  return {
    overall: clamp(overall),
    breakdown: {
      savingsRate: Math.round(savingsRate),
      budgetAdherence: Math.round(budgetAdherence),
      consistency: Math.round(consistency),
    },
  };
};

module.exports = { computeHealthScore };
