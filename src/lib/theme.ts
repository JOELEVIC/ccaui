import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
  defineSemanticTokens,
  mergeConfigs,
} from "@chakra-ui/react";

const ccaTokens = defineTokens({
  fonts: {
    heading: { value: "var(--font-playfair), Georgia, serif" },
    body: { value: "var(--font-inter), system-ui, sans-serif" },
    label: { value: "var(--font-oswald), var(--font-inter), sans-serif" },
    stat: { value: "var(--font-oswald), var(--font-inter), sans-serif" },
  },
  colors: {
    // Light redesign — cream canvas, charcoal-navy ink, champagne gold
    bgPrimary: { value: "#FDFBF7" },
    bgGradientStart: { value: "#FFFFFF" },
    bgSurface: { value: "#FFFFFF" },
    bgDark: { value: "#FDFBF7" },
    bgCard: { value: "#FFFFFF" },
    bgWarm: { value: "#F4EEE1" },
    gold: { value: "#C5A059" },
    goldLight: { value: "#D4AF37" },
    goldDark: { value: "#9C7D36" },
    accentGreen: { value: "#2E7D5B" },
    cameroonGreen: { value: "#007A3D" },
    cameroonRed: { value: "#CE1126" },
    cameroonYellow: { value: "#FCD116" },
    textPrimary: { value: "#1A2530" },
    textSecondary: { value: "#5B6770" },
    textMuted: { value: "#6E7680" },
    statusSuccess: { value: "#2E7D5B" },
    statusWarning: { value: "#C0492F" },
    // ── "The System" palette — light-mode accents (was Solo-Leveling neon)
    sysCyan: { value: "#0F8A99" },
    sysCyanDim: { value: "#0B6571" },
    sysPurple: { value: "#6A3FB5" },
    sysPurpleDim: { value: "#4A2A86" },
    sysEpic: { value: "#7A5CD0" },
    sysThreat: { value: "#C0492F" },
    sysVoid: { value: "#FDFBF7" },
    sysGlass: { value: "rgba(255, 255, 255, 0.72)" },
  },
  radii: {
    cca: { value: "10px" },
    soft: { value: "12px" },
  },
  shadows: {
    cardSoft: { value: "0 1px 2px rgba(26,37,48,.04), 0 8px 24px -12px rgba(26,37,48,.10)" },
    cardSoftHover: { value: "0 12px 30px -14px rgba(26,37,48,.16)" },
  },
});

const ccaSemanticTokens = defineSemanticTokens({
  colors: {
    "accent.gold": { value: "{colors.gold}" },
    "accent.gold.highlight": { value: "{colors.goldLight}" },
    "accent.gold.muted": { value: "{colors.goldDark}" },
    "bg.canvas": { value: "{colors.bgDark}" },
    "bg.surface": { value: "{colors.bgCard}" },
    "text.primary": { value: "{colors.textPrimary}" },
    "text.secondary": { value: "{colors.textSecondary}" },
    "text.muted": { value: "{colors.textMuted}" },
    "status.success": { value: "{colors.statusSuccess}" },
    "status.warning": { value: "{colors.statusWarning}" },
  },
});

const ccaTheme = defineConfig({
  theme: {
    tokens: ccaTokens,
    semanticTokens: ccaSemanticTokens,
  },
});

export const system = createSystem(mergeConfigs(defaultConfig, ccaTheme));
