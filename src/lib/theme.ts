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
  },
  colors: {
    // Backgrounds
    bgPrimary: { value: "#0F1115" },
    bgGradientStart: { value: "#12151C" },
    bgSurface: { value: "#161A22" },
    // Aliases so existing bgDark/bgCard keep working
    bgDark: { value: "#0F1115" },
    bgCard: { value: "#161A22" },
    // Gold system (max 3 shades)
    gold: { value: "#C6A75E" },
    goldLight: { value: "#E8C77A" },
    goldDark: { value: "#8F793D" },
    // Text
    textPrimary: { value: "#EAEAEA" },
    textSecondary: { value: "#B8BDC7" },
    textMuted: { value: "#7E8795" },
    // Status
    statusSuccess: { value: "#1F3B2D" },
    statusWarning: { value: "#5A1F1F" },
  },
  radii: {
    cca: { value: "6px" },
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
