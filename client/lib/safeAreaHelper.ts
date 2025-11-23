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
 * Generate Tailwind safe area classes
 */
export function getSafeAreaClasses(): {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
} {
  const insets = getSafeAreaInsets();

  const convertToTailwind = (pixels: number): string => {
    if (pixels === 0) return "0";
    if (pixels <= 4) return "1";
    if (pixels <= 8) return "2";
    if (pixels <= 12) return "3";
    if (pixels <= 16) return "4";
    if (pixels <= 20) return "5";
    if (pixels <= 24) return "6";
    if (pixels <= 32) return "8";
    return `[${pixels}px]`;
  };

  return {
    paddingTop: `pt-[${insets.top}px]`,
    paddingBottom: `pb-[${insets.bottom}px]`,
    paddingLeft: `pl-[${insets.left}px]`,
    paddingRight: `pr-[${insets.right}px]`,
  };
}

/**
 * Check if device has notch or safe area insets
 */
export function hasNotch(): boolean {
  const insets = getSafeAreaInsets();
  return insets.top > 0 || insets.bottom > 0;
}

/**
 * React component for safe area padding
 */
export function SafeAreaView({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const insets = getSafeAreaInsets();

  return (
    <div
      className={className}
      style={{
        paddingTop: `${insets.top}px`,
        paddingRight: `${insets.right}px`,
        paddingBottom: `${insets.bottom}px`,
        paddingLeft: `${insets.left}px`,
      }}
    >
      {children}
    </div>
  );
}