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
    // DChessAcademy navy + gold
    bgPrimary: { value: "#0a0e1a" },
    bgGradientStart: { value: "#12182a" },
    bgSurface: { value: "#1a2238" },
    bgDark: { value: "#0a0e1a" },
    bgCard: { value: "#141b2e" },
    bgWarm: { value: "#1a2238" },
    gold: { value: "#e6a452" },
    goldLight: { value: "#f0b870" },
    goldDark: { value: "#b87a2a" },
    accentGreen: { value: "#4caf50" },
    cameroonGreen: { value: "#007A3D" },
    cameroonRed: { value: "#CE1126" },
    cameroonYellow: { value: "#FCD116" },
    textPrimary: { value: "#f0f2f8" },
    textSecondary: { value: "#a8b0c4" },
    textMuted: { value: "#6b728e" },
    statusSuccess: { value: "#1b3d24" },
    statusWarning: { value: "#5A1F1F" },
    // ── "The System" palette (Solo-Leveling lobby UI) ─────────────────
    sysCyan: { value: "#00F0FF" },
    sysCyanDim: { value: "#0FA8B5" },
    sysPurple: { value: "#8A2BE2" },
    sysPurpleDim: { value: "#5C1AA8" },
    sysEpic: { value: "#B197FC" },
    sysThreat: { value: "#F06595" },
    sysVoid: { value: "#050505" },
    sysGlass: { value: "rgba(10, 11, 14, 0.7)" },
  },
  radii: {
    cca: { value: "10px" },
    soft: { value: "12px" },
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
