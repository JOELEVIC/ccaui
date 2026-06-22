import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sys: {
          cyan: "var(--sys-cyan)",
          cyanDim: "var(--sys-cyan-dim)",
          purple: "var(--sys-purple)",
          purpleDim: "var(--sys-purple-dim)",
          epic: "var(--sys-epic)",
          threat: "var(--sys-threat)",
          void: "var(--sys-void)",
          glass: "var(--sys-glass)",
          prestige: "var(--sys-prestige-gold)",
          onyx: "var(--sys-prestige-onyx)",
        },
        // Light-mode redesign tokens (cream / charcoal-navy / champagne gold)
        canvas: "#FDFBF7",
        surface: "#FFFFFF",
        ink: "#1A2530",
        "ink-60": "#5B6770",
        "ink-30": "#9AA2A8",
        line: "#ECEAE3",
        gold: "#C5A059",
        "gold-hi": "#D4AF37",
        "gold-10": "#F4EEE1",
        up: "#2E7D5B",
        down: "#C0492F",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: {
        "sys-cyan": "var(--sys-glow-cyan)",
        "sys-purple": "var(--sys-glow-purple)",
        "sys-threat": "var(--sys-glow-threat)",
        "sys-epic": "var(--sys-glow-epic)",
        "sys-prestige": "var(--sys-glow-prestige)",
        card: "0 1px 2px rgba(26,37,48,.04), 0 8px 24px -12px rgba(26,37,48,.10)",
        gold: "0 8px 30px -10px rgba(197,160,89,.45)",
      },
    },
  },
  // Preflight OFF: this app is Chakra-driven and emits no Tailwind base today.
  // Keeping it off lets the new utility classes coexist without resetting Chakra.
  corePlugins: { preflight: false },
  plugins: [],
};
export default config;
