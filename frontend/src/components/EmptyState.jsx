import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card py-14 px-6 text-center flex flex-col items-center"
  >
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-glass flex items-center justify-center mb-4">
        <Icon size={26} className="text-mint-400" />
      </div>
    )}
    <p className="text-sm font-medium text-mist-100">{title}</p>
    {subtitle && <p className="text-xs text-mist-500 mt-1 max-w-xs">{subtitle}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary mt-5 px-5 py-2.5 text-sm">
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;