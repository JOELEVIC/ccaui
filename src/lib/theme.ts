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
    // Backgrounds (warmer darks)
    bgPrimary: { value: "#111318" },
    bgGradientStart: { value: "#13151A" },
    bgSurface: { value: "#1A1E26" },
    bgDark: { value: "#111318" },
    bgCard: { value: "#1A1E26" },
    bgWarm: { value: "#1E1C18" },
    // Gold system (slightly warmer primary)
    gold: { value: "#C9A96E" },
    goldLight: { value: "#E8C77A" },
    goldDark: { value: "#8F793D" },
    // Cameroon flag (sparing use)
    cameroonGreen: { value: "#007A3D" },
    cameroonRed: { value: "#CE1126" },
    cameroonYellow: { value: "#FCD116" },
    // Text
    textPrimary: { value: "#EAEAEA" },
    textSecondary: { value: "#B8BDC7" },
    textMuted: { value: "#7E8795" },
    statusSuccess: { value: "#1F3B2D" },
    statusWarning: { value: "#5A1F1F" },
  },
  radii: {
    cca: { value: "6px" },
    soft: { value: "10px" },
  },
  shadows: {
    cardSoft: { value: "0 4px 24px rgba(0, 0, 0, 0.2)" },
    cardSoftHover: { value: "0 8px 32px rgba(0, 0, 0, 0.25)" },
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
