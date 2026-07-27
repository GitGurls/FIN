import { motion } from "framer-motion";

const StatCard = ({ label, value, sublabel, accent = "mint", icon: Icon }) => {
  const accentClasses = {
    mint: "text-mint-400",
    violet: "text-violet-400",
    gold: "text-gold-400",
    coral: "text-coral-400",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-mist-500">{label}</span>
        {Icon && <Icon size={16} className={accentClasses[accent]} />}
      </div>
      <p className={`stat-mono text-2xl font-semibold ${accentClasses[accent]}`}>{value}</p>
      {sublabel && <p className="text-xs text-mist-500 mt-1">{sublabel}</p>}
    </motion.div>
  );
};

export default StatCard;
