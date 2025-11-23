import React from "react";
import { getSafeAreaPadding } from "../lib/safeAreaHelper";

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = "",
  top = true,
  bottom = true,
  left = true,
  right = true,
}) => {
  const insets = getSafeAreaPadding();

  const style: React.CSSProperties = {};

  if (top) style.paddingTop = insets.paddingTop;
  if (bottom) style.paddingBottom = insets.paddingBottom;
  if (left) style.paddingLeft = insets.paddingLeft;
  if (right) style.paddingRight = insets.paddingRight;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
