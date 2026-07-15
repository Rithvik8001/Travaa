import { cn } from "@/lib/utils";

/** Shared horizontal rhythm for every landing section. */
export function Container({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-285 px-5.5 min-[560px]:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
