import { clsx } from "clsx";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto w-full min-w-0 max-w-[82rem] px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
