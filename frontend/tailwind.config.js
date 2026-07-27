/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "var(--ink-950)",
          900: "var(--ink-900)",
          800: "var(--ink-800)",
          700: "var(--ink-700)",
        },
        mint: {
          400: "#5EEAD4",
          500: "#34D8B9",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B6EF0",
        },
        gold: {
          400: "#F5B754",
        },
        coral: {
          400: "#F87171",
        },
        mist: {
          100: "var(--mist-100)",
          300: "var(--mist-300)",
          500: "var(--mist-500)",
        },
        glassline: "var(--glassline)",
        glassfill: "var(--glassfill)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "aura-mesh": "var(--aura-mesh)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(94,234,212,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
