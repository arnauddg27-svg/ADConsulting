import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[1.75rem] border border-white/[0.1] bg-white/[0.045] shadow-[0_30px_70px_-60px_rgba(0,0,0,1)] backdrop-blur-xl",
        paddings[padding],
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-white/[0.065]",
        className
      )}
    >
      {children}
    </div>
  );
}
