import { motion } from "framer-motion";
import { Target } from "lucide-react";

const fmt = (n, currency) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

const BudgetProgress = ({ spent, budget, currency }) => {
  const pct = Math.min((spent / budget) * 100, 100);
  const color = pct >= 100 ? "#F87171" : pct >= 90 ? "#F5B754" : "#5EEAD4";

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color }} />
          <span className="text-xs uppercase tracking-wide text-mist-500">Monthly Budget Progress</span>
        </div>
        <span className="stat-mono text-sm" style={{ color }}>
          {fmt(spent, currency)} / {fmt(budget, currency)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-glass overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      {pct >= 90 && (
        <p className="text-xs mt-2" style={{ color }}>
          {pct >= 100 ? "You've crossed your monthly budget." : "You're close to your monthly budget limit."}
        </p>
      )}
    </div>
  );
};

export default BudgetProgress;
