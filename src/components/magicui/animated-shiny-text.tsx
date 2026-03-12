import { type ComponentPropsWithoutRef, type CSSProperties, type FC } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
          backgroundSize: `${shimmerWidth}px 100%`,
          backgroundPosition: "0 0",
          backgroundRepeat: "no-repeat",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundImage:
            "linear-gradient(to right, transparent, rgba(52, 211, 153, 0.9) 50%, transparent)",
          animation: "shiny-text 3s cubic-bezier(0.6,0.6,0,1) infinite",
        } as CSSProperties
      }
      className={cn("text-accent-300/70", className)}
      {...props}
    >
      {children}
    </span>
  );
};
