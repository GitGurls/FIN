import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-mist-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.dataKey}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const TrendChart = ({ data }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-5">
      <TrendingUp size={16} className="text-mint-400" />
      <span className="text-xs uppercase tracking-wide text-mist-500">Income vs Expense — 6 months</span>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F87171" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" stroke="#8890A6" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#8890A6" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="income" stroke="#5EEAD4" fill="url(#incomeGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="expense" stroke="#F87171" fill="url(#expenseGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default TrendChart;
