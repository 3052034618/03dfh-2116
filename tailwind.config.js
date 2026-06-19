/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          950: "#0F0D14",
          900: "#1A1620",
          850: "#1E1A27",
          800: "#251E30",
          700: "#2F2740",
          600: "#3D3352",
          500: "#524568",
          400: "#6E5E8A",
        },
        royal: {
          50: "#F5F0FF",
          100: "#E8DFFF",
          300: "#8B6FC9",
          500: "#6B46C1",
          600: "#553C9A",
          700: "#4B2E7A",
          800: "#3B2463",
          900: "#2D1B4E",
        },
        amber: {
          50: "#FDF8EC",
          100: "#F8EDC8",
          300: "#E8C76A",
          400: "#DDB753",
          500: "#D4A84B",
          600: "#B8912E",
          700: "#8F7222",
        },
        crimson: {
          50: "#FBECEE",
          300: "#E07B8A",
          500: "#C93A4E",
          600: "#A82A3D",
          700: "#8B2635",
          800: "#6E1E2B",
        },
        mint: {
          50: "#ECF9F0",
          300: "#7ED499",
          500: "#4CB86E",
          600: "#3DA35D",
          700: "#2F8549",
        },
        sunset: {
          50: "#FFF4EB",
          300: "#F4A96F",
          500: "#E8873A",
          600: "#CF6D1F",
          700: "#A85618",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', "Georgia", "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(212, 168, 75, 0.15)",
        "glow-lg": "0 0 40px rgba(212, 168, 75, 0.25)",
        "glow-danger": "0 0 20px rgba(201, 58, 78, 0.3)",
        "glow-success": "0 0 20px rgba(76, 184, 110, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        "radial-glow": "radial-gradient(ellipse at top, rgba(75, 46, 122, 0.3) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
