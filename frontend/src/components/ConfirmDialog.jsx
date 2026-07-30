import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-[70]"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-6 w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-coral-400/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-coral-400" />
            </div>
            <h3 className="font-display font-semibold">{title || "Are you sure?"}</h3>
          </div>
          {message && <p className="text-sm text-mist-500 mb-5">{message}</p>}
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-coral-400 text-ink-950 font-semibold px-5 py-3 hover:bg-coral-400/90 transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;