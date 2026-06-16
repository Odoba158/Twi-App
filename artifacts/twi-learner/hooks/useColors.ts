import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current theme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 */
export function useColors() {
  const { activePalette } = useTheme();
  
  const palette = colors[activePalette] || colors.light;
  return { ...palette, radius: colors.radius };
}
