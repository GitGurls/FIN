import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import api from "../lib/api";

const SUGGESTIONS = [
  "Is month sabse zyada kaha kharch hua?",
  "Am I saving enough this month?",
  "Compare this month vs last month",
];

const ChatWithExpenses = () => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me anything about your spending — I'll answer using your real transaction data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const streamingIndexRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const onChunk = ({ chunk }) => {
      setMessages((prev) => {
        const next = [...prev];
        const idx = streamingIndexRef.current;
        if (idx !== null && next[idx]) {
          next[idx] = { ...next[idx], text: next[idx].text + chunk };
        }
        return next;
      });
    };

    const onDone = () => {
      setStreaming(false);
      streamingIndexRef.current = null;
    };

    const onError = ({ message }) => {
      setStreaming(false);
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
      streamingIndexRef.current = null;
    };

    socket.on("chat:chunk", onChunk);
    socket.on("chat:done", onDone);
    socket.on("chat:error", onError);
    return () => {
      socket.off("chat:chunk", onChunk);
      socket.off("chat:done", onDone);
      socket.off("chat:error", onError);
    };
  }, [socket]);

  const sendViaRest = async (question) => {
    try {
      const res = await api.post("/chat", { message: question });
      setMessages((m) => [...m, { role: "assistant", text: res.data.answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: err.response?.data?.message || "Couldn't reach the AI copilot." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || streaming) return;

    setInput("");
    setStreaming(true);
    setMessages((prev) => {
      const withQuestion = [...prev, { role: "user", text: question }, { role: "assistant", text: "" }];
      streamingIndexRef.current = withQuestion.length - 1;
      return withQuestion;
    });

    if (socket && connected) {
      socket.emit("chat:message", { message: question });
    } else {
      await sendViaRest(question);
    }

    setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 50);
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-xs uppercase tracking-wide text-mist-500">Chat with your expenses</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1 mb-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm px-4 py-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                m.role === "user"
                  ? "bg-mint-400/10 border border-mint-400/20 ml-auto text-mist-100"
                  : "bg-glass border border-glass text-mist-300"
              }`}
            >
              {m.text || (streaming && i === messages.length - 1 ? "…" : "")}
            </motion.div>
          ))}
        </AnimatePresence>
        {streaming && (
          <div className="flex items-center gap-2 text-mist-500 text-sm">
            <Loader2 size={14} className="animate-spin" /> Typing…
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-glass text-mist-500 hover:text-mist-100 hover-border-glass transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          className="glass-input"
          placeholder="Ask about your spending…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={streaming} className="btn-primary px-4 shrink-0">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWithExpenses;
