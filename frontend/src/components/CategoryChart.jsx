import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

const PALETTE = ["#5EEAD4", "#A78BFA", "#F5B754", "#F87171", "#60A5FA", "#F472B6"];

const CategoryChart = ({ data }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-5">
      <PieIcon size={16} className="text-violet-400" />
      <span className="text-xs uppercase tracking-wide text-mist-500">This month by category</span>
    </div>
    {data?.length ? (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            stroke="#8890A6"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{
              background: "#101528",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={16}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-sm text-mist-500 py-10 text-center">No expenses recorded this month yet.</p>
    )}
  </div>
);

export default CategoryChart;
