import { clsx } from "clsx";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  alignment = "center",
}: SectionHeadingProps) {
  const centered = alignment === "center";

  return (
    <div className={clsx("mb-12 md:mb-16", centered && "text-center")}>
      {label && (
        <span className={clsx("eyebrow", centered && "justify-center")}>
          {label}
        </span>
      )}
      <h2
        className={clsx(
          "mt-5 max-w-4xl font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 sm:text-5xl",
          centered && "mx-auto"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            "mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
