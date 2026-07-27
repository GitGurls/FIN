import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 bg-aura-mesh flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-mint-400 to-violet-400 flex items-center justify-center">
            <Sparkles size={20} className="text-ink-950" />
          </div>
          <span className="font-display font-semibold text-xl">FinPilot AI</span>
        </div>

        <h1 className="text-2xl font-display font-semibold mb-1">Welcome back</h1>
        <p className="text-mist-500 text-sm mb-6">Log in to your personal finance copilot.</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-coral-400/10 border border-coral-400/20 text-coral-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-mist-300 mb-1.5 block">Email</label>
            <input
              type="email"
              required
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            <LogIn size={18} />
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-mist-500 mt-6 text-center">
          New here?{" "}
          <Link to="/register" className="text-mint-400 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
