import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

const ringColor = (score) => {
  if (score >= 75) return "#5EEAD4";
  if (score >= 50) return "#F5B754";
  return "#F87171";
};

const HealthScoreCard = ({ data, loading }) => {
  const score = data?.overall ?? 0;
  const color = ringColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <HeartPulse size={16} className="text-mint-400" />
        <span className="text-xs uppercase tracking-wide text-mist-500">
          AI Financial Health Score
        </span>
      </div>

      <div className="flex items-center gap-6 flex-1">
        <div className="relative shrink-0 h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {!loading && (
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="stat-mono text-3xl font-semibold" style={{ color }}>
              {loading ? "—" : score}
            </span>
            <span className="text-[10px] text-mist-500 uppercase tracking-wide">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {data?.breakdown &&
            Object.entries(data.breakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-xs text-mist-500 mb-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-mono">{val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-glass overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-mint-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {data?.explanation && (
        <p className="text-sm text-mist-300 mt-5 pt-4 border-t border-glass leading-relaxed">
          {data.explanation}
        </p>
      )}
    </div>
  );
};

export default HealthScoreCard;
