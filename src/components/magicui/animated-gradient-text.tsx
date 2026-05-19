import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AnimatedGradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative inline-flex max-w-fit flex-row items-center justify-center overflow-hidden rounded-full border border-[#cbd6dc] bg-white/72 px-4 py-2 text-[0.66rem] font-bold uppercase leading-5 tracking-[0.16em] text-[#2f5368] shadow-[inset_0_-8px_10px_rgba(53,95,122,0.08),0_16px_40px_-34px_rgba(23,33,44,0.42)] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_rgba(53,95,122,0.16),0_18px_44px_-34px_rgba(23,33,44,0.48)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#d7eaf5]/70 via-[#5bbf98]/55 to-[#d7eaf5]/70 bg-[length:var(--bg-size)_100%] p-px [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:subtract]"
      />

      <span className="relative z-10">{children}</span>
    </div>
  );
}
