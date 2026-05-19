import { cn } from "@/lib/utils";

type LiquidActionTone = "primary" | "secondary" | "frost";
type LiquidActionSize = "sm" | "md" | "lg";

export function liquidActionClass({
  tone = "primary",
  size = "md",
  className,
}: {
  tone?: LiquidActionTone;
  size?: LiquidActionSize;
  className?: string;
} = {}) {
  return cn(
    "liquid-action",
    `liquid-action-${tone}`,
    `liquid-action-${size}`,
    className,
  );
}
