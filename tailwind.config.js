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
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(114, 214, 255, 0.12), 0 12px 40px rgba(7, 29, 48, 0.45)",
        "glow-strong": "0 0 24px rgba(70, 180, 255, 0.22), 0 18px 60px rgba(5, 11, 23, 0.72)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top, rgba(67, 162, 255, 0.20), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 185, 94, 0.10), transparent 35%)",
        "panel-gradient":
          "linear-gradient(135deg, rgba(11, 16, 27, 0.88), rgba(14, 22, 34, 0.72))"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseglow: "pulseglow 5s ease-in-out infinite",
        drift: "drift 20s linear infinite"
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
        }
      }
    }
  },
  plugins: []
};
