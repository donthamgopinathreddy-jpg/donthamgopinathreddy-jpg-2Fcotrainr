import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Height conversion utilities
export const cmToInches = (cm: number): number => {
  return Math.round((cm / 2.54) * 10) / 10;
};

export const inchesToCm = (inches: number): number => {
  return Math.round(inches * 2.54);
};

export const cmToFeetInches = (
  cm: number,
): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
};

export const cmToFeetInchesString = (cm: number): string => {
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
};

export const inchesToFeetInches = (
  totalInches: number,
): { feet: number; inches: number } => {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
};

export const inchesToFeetInchesString = (totalInches: number): string => {
  const { feet, inches } = inchesToFeetInches(totalInches);
  return `${feet}'${inches}"`;
};
