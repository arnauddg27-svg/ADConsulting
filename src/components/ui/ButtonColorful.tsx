"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonColorfulProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
  href?: string;
  /** Render the trailing arrow icon. Default true. */
  showIcon?: boolean;
  /** Sizing scale to match the existing Button sm/md/lg. Default md. */
  size?: "sm" | "md" | "lg";
}

/**
 * 21st.dev colorful button, brand-aligned to the emerald/cyan palette.
 * Dark zinc pill with a soft gradient halo behind it; the halo strengthens
 * on hover and the icon nudges. Renders as <a> when href is set so it
 * works with Next.js routing.
 */
const sizeClasses: Record<NonNullable<ButtonColorfulProps["size"]>, string> = {
  sm: "h-9 px-4 text-[0.78rem] tracking-[0.1em]",
  md: "h-11 px-5 text-[0.88rem] tracking-[0.08em]",
  lg: "h-[3.25rem] px-7 text-[1rem] tracking-[0.06em]",
};

export function ButtonColorful({
  className,
  label = "Explore",
  href,
  showIcon = true,
  size = "md",
  ...props
}: ButtonColorfulProps) {
  const inner = (
    <>
      {/* Gradient halo */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-accent-500 via-cyan-400 to-accent-500",
          "opacity-50 group-hover:opacity-90",
          "blur-md transition-opacity duration-500"
        )}
      />

      {/* Foreground content */}
      <div className="relative flex items-center justify-center gap-2">
        <span className="text-white">{label}</span>
        {showIcon && (
          <ArrowUpRight className="h-3.5 w-3.5 text-white/90 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </div>
    </>
  );

  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
    "bg-zinc-950 font-semibold uppercase",
    sizeClasses[size],
    "shadow-[0_18px_40px_-18px_rgba(16,185,129,0.55)] transition-all duration-300",
    "hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-16px_rgba(16,185,129,0.7)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button {...props} className={classes}>
      {inner}
    </button>
  );
}

export default ButtonColorful;
