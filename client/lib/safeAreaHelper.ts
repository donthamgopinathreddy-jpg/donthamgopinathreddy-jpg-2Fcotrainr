/**
 * Safe area utilities for handling mobile device notches, camera cutouts, and status bars
 * Works with CSS environment variables: safe-area-inset-top, safe-area-inset-bottom, etc.
 */

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Get safe area insets from CSS environment variables
 */
export function getSafeAreaInsets(): SafeAreaInsets {
  const getInset = (variable: string): number => {
    if (typeof window === "undefined") return 0;

    const value = getComputedStyle(document.documentElement).getPropertyValue(
      `--safe-area-${variable}`
    );

    if (!value) {
      // Fallback to iOS/Android standard values
      try {
        const envValue = (
          getComputedStyle(document.documentElement)
            .getPropertyValue(`safe-area-inset-${variable}`) || "0px"
        )
          .trim()
          .replace("px", "");
        return parseInt(envValue, 10) || 0;
      } catch {
        return 0;
      }
    }

    return parseInt(value.replace("px", ""), 10) || 0;
  };

  return {
    top: getInset("top"),
    right: getInset("right"),
    bottom: getInset("bottom"),
    left: getInset("left"),
  };
}

/**
 * Generate safe area padding values as strings
 */
export function getSafeAreaPadding(): {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
} {
  const insets = getSafeAreaInsets();

  return {
    paddingTop: `${insets.top}px`,
    paddingBottom: `${insets.bottom}px`,
    paddingLeft: `${insets.left}px`,
    paddingRight: `${insets.right}px`,
  };
}

/**
 * Check if device has notch or safe area insets
 */
export function hasNotch(): boolean {
  const insets = getSafeAreaInsets();
  return insets.top > 0 || insets.bottom > 0;
}
