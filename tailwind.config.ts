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
      },
      boxShadow: {
        "sys-cyan": "var(--sys-glow-cyan)",
        "sys-purple": "var(--sys-glow-purple)",
        "sys-threat": "var(--sys-glow-threat)",
        "sys-epic": "var(--sys-glow-epic)",
        "sys-prestige": "var(--sys-glow-prestige)",
      },
    },
  },
  plugins: [],
};
export default config;
