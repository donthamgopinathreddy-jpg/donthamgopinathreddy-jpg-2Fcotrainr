interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
  xl: "h-24 w-auto",
  "2xl": "h-32 w-auto",
};

export default function Logo({ size = "md", className }: LogoProps) {
  const sizeClass = sizeMap[size];

  return (
    <img
      src="https://cdn.builder.io/api/v1/image/assets%2Fc659d255956c4643b6576a691786eec0%2Fe823f4816a094df5bccc1efcb008e8ff?format=webp&width=800"
      alt="CoTrainr Logo"
      className={`${sizeClass} ${className}`}
    />
  );
}
