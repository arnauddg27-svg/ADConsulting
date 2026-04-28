import Link from "next/link";
import { clsx } from "clsx";

/* "Cool" treatment from the 21st.dev button bundle, adapted to the brand:
   vertical gradient (top brighter), thicker dark bottom border for a raised
   feel, inset white ring for a subtle highlight, soft accent-tinted shadow,
   brightness shift on hover/press. Reads as a polished raised pill rather
   than a glowing halo. */
const variants = {
  primary:
    "border border-b-2 border-zinc-950/40 bg-gradient-to-t from-accent-600 to-accent-400 text-white shadow-md shadow-accent-500/30 ring-1 ring-inset ring-white/25 transition-[filter,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-accent-500/40 active:brightness-95 active:translate-y-0",
  secondary:
    "border border-b-2 border-zinc-950/40 bg-gradient-to-t from-white/[0.04] to-white/[0.1] text-slate-50 ring-1 ring-inset ring-white/10 transition-[filter,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:brightness-95 active:translate-y-0",
  outline:
    "border-white/[0.16] bg-transparent text-slate-100 hover:border-accent-400 hover:bg-accent-500/10",
  ghost: "border-transparent text-slate-200 hover:bg-white/[0.05]",
};

const sizes = {
  sm: "px-4 py-2.5 text-[0.68rem]",
  md: "px-5 py-3 text-[0.72rem]",
  lg: "px-5 py-3.5 text-[0.72rem] sm:px-6 sm:py-4 sm:text-[0.78rem]",
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
