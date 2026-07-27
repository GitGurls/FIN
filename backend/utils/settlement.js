/**
 * Given a map of { userId: netBalance } (positive = is owed money, negative = owes money),
 * returns a minimal list of settlements: [{ from, to, amount }].
 * Greedy algorithm: repeatedly match the biggest debtor with the biggest creditor.
 */
const computeSettlements = (balances) => {
  const entries = Object.entries(balances)
    .map(([userId, amount]) => ({ userId, amount: Math.round(amount * 100) / 100 }))
    .filter((e) => Math.abs(e.amount) > 0.5);

  const creditors = entries.filter((e) => e.amount > 0).sort((a, b) => b.amount - a.amount);
  const debtors = entries.filter((e) => e.amount < 0).sort((a, b) => a.amount - b.amount);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.amount, creditor.amount);

    if (amount > 0.5) {
      settlements.push({ from: debtor.userId, to: creditor.userId, amount: Math.round(amount * 100) / 100 });
    }

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.5) i++;
    if (Math.abs(creditor.amount) < 0.5) j++;
  }

  return settlements;
};

module.exports = { computeSettlements };
