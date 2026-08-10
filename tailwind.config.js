/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        noir: {
          bg0: "var(--bg-0)",
          bg1: "var(--bg-1)",
          surface: "var(--surface)",
          surfaceElevated: "var(--surface-elevated)",
          borderSubtle: "var(--border-subtle)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          purple: "var(--purple-accent)",
          pink: "var(--pink-accent)",
          cyan: "var(--cyan-accent)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(138, 43, 226, 0.1), 0 12px 30px rgba(0, 0, 0, 0.35)",
        "glow-strong": "0 0 20px rgba(138, 43, 226, 0.2), 0 18px 45px rgba(0, 0, 0, 0.5)",
        "glow-sm": "0 0 0 1px rgba(138, 43, 226, 0.05), 0 4px 15px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(138, 43, 226, 0.15)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top, rgba(139, 92, 246, 0.08), transparent 45%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.05), transparent 40%)",
        "panel-gradient":
          "linear-gradient(135deg, rgba(14, 17, 26, 0.88), rgba(9, 11, 18, 0.72))"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        pulseglow: "pulseglow 8s ease-in-out infinite",
        drift: "drift 25s linear infinite",
        aurora: "aurora 15s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 4s ease-in-out infinite",
        "glow-breathe": "glow-breathe 8s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.55s ease forwards"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        pulseglow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.92" }
        },
        drift: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-80px, 40px, 0)" }
        },
        aurora: {
          "0%, 100%": { opacity: "0", transform: "translateX(-10px)" },
          "20%, 80%": { opacity: "1" },
          "50%": { opacity: "0.65", transform: "translateX(10px)" }
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0px)", opacity: "0.5" },
          "50%": { transform: "translateY(-7px)", opacity: "1" }
        },
        "glow-breathe": {
          "0%, 100%": { opacity: "0.28" },
          "50%": { opacity: "0.68" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};
