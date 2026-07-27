import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Check, Loader2 } from "lucide-react";
import api from "../lib/api";

const getRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-IN";
  return recognition;
};

const VoiceEntry = ({ open, onClose, onConfirmed }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsing, setParsing] = useState(false);
  const [suggested, setSuggested] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef(null);
  const supported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();
      setListening(false);
      setTranscript("");
      setSuggested(null);
      setError("");
    }
  }, [open]);

  const startListening = () => {
    const recognition = getRecognition();
    if (!recognition) {
      setError("Voice input isn't supported in this browser — try Chrome.");
      return;
    }
    setError("");
    setSuggested(null);
    setTranscript("");
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setTranscript(text);
    };
    recognition.onerror = () => setError("Couldn't hear that clearly — try again.");
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
  };

  const stopAndParse = async () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (!transcript.trim()) return;

    setParsing(true);
    setError("");
    try {
      const res = await api.post("/transactions/parse-voice", { transcript });
      setSuggested({ ...res.data.suggested, date: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't understand that — try rephrasing.");
    } finally {
      setParsing(false);
    }
  };

  const confirm = async () => {
    setSaving(true);
    try {
      await api.post("/transactions", { ...suggested, source: "voice" });
      onConfirmed?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg">Voice Entry</h2>
            <button onClick={onClose} className="text-mist-500 hover:text-mist-100">
              <X size={18} />
            </button>
          </div>

          {!supported && (
            <p className="text-sm text-coral-400 mb-4">
              Voice input isn't supported in this browser — try Chrome on desktop or Android.
            </p>
          )}

          <div className="flex flex-col items-center py-6">
            <button
              onClick={listening ? stopAndParse : startListening}
              disabled={!supported || parsing}
              className={`h-20 w-20 rounded-full flex items-center justify-center transition-colors ${
                listening ? "bg-coral-400 animate-pulse" : "bg-mint-400"
              }`}
            >
              {listening ? <MicOff size={28} className="text-ink-950" /> : <Mic size={28} className="text-ink-950" />}
            </button>
            <p className="text-sm text-mist-500 mt-4">
              {listening ? "Listening… tap to stop" : parsing ? "Understanding…" : "Tap to speak"}
            </p>
            {transcript && <p className="text-sm text-mist-300 mt-3 text-center italic">"{transcript}"</p>}
            {parsing && <Loader2 size={18} className="animate-spin text-mint-400 mt-3" />}
          </div>

          {error && <p className="text-sm text-coral-400 text-center mb-2">{error}</p>}

          {suggested && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-mist-500">Type</label>
                  <select
                    className="glass-input mt-1"
                    value={suggested.type}
                    onChange={(e) => setSuggested((s) => ({ ...s, type: e.target.value }))}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-mist-500">Amount</label>
                  <input
                    type="number"
                    className="glass-input mt-1"
                    value={suggested.amount}
                    onChange={(e) => setSuggested((s) => ({ ...s, amount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-mist-500">Category</label>
                <input
                  className="glass-input mt-1"
                  value={suggested.category}
                  onChange={(e) => setSuggested((s) => ({ ...s, category: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-mist-500">Note</label>
                <input
                  className="glass-input mt-1"
                  value={suggested.note}
                  onChange={(e) => setSuggested((s) => ({ ...s, note: e.target.value }))}
                />
              </div>
              <button onClick={confirm} disabled={saving} className="btn-primary w-full">
                <Check size={16} /> {saving ? "Saving…" : "Confirm & Add"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceEntry;
