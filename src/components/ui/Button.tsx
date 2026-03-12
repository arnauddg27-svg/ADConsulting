import Link from "next/link";
import { clsx } from "clsx";

const variants = {
  primary:
    "border-accent-500 bg-accent-500 text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_24px_50px_-16px_rgba(16,185,129,0.6)]",
  secondary:
    "border-white/[0.1] bg-white/[0.06] text-slate-50 hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.09]",
  outline:
    "border-white/[0.16] bg-transparent text-slate-100 hover:border-accent-400 hover:bg-accent-500/10",
  ghost: "border-transparent text-slate-200 hover:bg-white/[0.05]",
};

const sizes = {
  sm: "px-4 py-2.5 text-[0.68rem]",
  md: "px-5 py-3 text-[0.72rem]",
  lg: "px-6 py-4 text-[0.78rem]",
};

interface ButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  href,
  onClick,
  className,
  type = "button",
}: ButtonProps) {
  const classes = clsx(
    "group inline-flex items-center justify-center gap-2 rounded-full border text-center font-semibold uppercase tracking-[0.18em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 cursor-pointer",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
