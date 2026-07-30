import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, PartyPopper, CheckCircle2, XCircle, X } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const ICONS = {
  budget_warning: AlertTriangle,
  budget_exceeded: AlertTriangle,
  goal_achieved: PartyPopper,
  success: CheckCircle2,
  error: XCircle,
};

const ACCENTS = {
  budget_warning: "border-gold-400/30 text-gold-400",
  budget_exceeded: "border-coral-400/30 text-coral-400",
  goal_achieved: "border-mint-400/30 text-mint-400",
  success: "border-mint-400/30 text-mint-400",
  error: "border-coral-400/30 text-coral-400",
};

const NotificationToasts = () => {
  const { socket } = useSocket();
  const [toasts, setToasts] = useState([]);

  const push = (payload) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, ...payload }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => push(payload);
    socket.on("notification", handler);
    return () => socket.off("notification", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    const handler = (e) => push(e.detail);
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <div className="fixed top-5 right-5 z-[60] space-y-2 w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle2;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`glass-card p-4 flex items-start gap-3 border ${ACCENTS[t.type] || ""}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mist-100">{t.title}</p>
                {t.message && <p className="text-xs text-mist-500 mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-mist-500 hover:text-mist-100">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToasts;