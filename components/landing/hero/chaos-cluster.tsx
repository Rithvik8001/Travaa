import { cn } from "@/lib/utils";

/** The "before Travaa" pile: scattered chat, payment, and notes fragments. */
export function ChaosCluster({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      aria-hidden
      className={cn("relative h-[360px] min-[900px]:h-[420px]", className)}
    >
      <Bubble className="top-5 left-2 max-w-[250px] -rotate-[4deg]">
        so are we actually doing lisbon or not
      </Bubble>

      <div className="absolute top-24 right-0 max-w-[220px] rotate-[3deg] rounded-[16px_16px_5px_16px] border border-[oklch(0.86_0.05_150)] bg-[oklch(0.95_0.035_150)] px-4 py-[13px] text-[14.5px] text-[oklch(0.34_0.05_150)] shadow-[0_12px_30px_-14px_oklch(0.4_0.04_150/0.35)]">
        who actually booked the airbnb??
      </div>

      <div className="border-hairline bg-surface absolute top-[172px] left-0 w-[236px] -rotate-[2.5deg] rounded-[14px] border px-4 py-[14px] shadow-[0_14px_34px_-16px_oklch(0.4_0.02_90/0.34)]">
        <div className="mb-1.5 text-[11px] font-semibold tracking-[0.05em] text-[oklch(0.6_0.1_40)] uppercase">
          Payment request
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[oklch(0.3_0.006_90)]">Sam requested</span>
          <span className="text-ink text-base font-semibold">$148.00</span>
        </div>
      </div>

      <div className="bg-surface-sunken absolute top-[246px] right-3.5 w-[216px] rotate-[4deg] rounded-xl border border-[oklch(0.9_0.004_90)] px-[15px] py-3 shadow-float">
        <div className="text-subtle-foreground mb-[7px] text-[11px] font-semibold tracking-[0.05em] uppercase">
          Notes
        </div>
        <div className="font-mono text-[13px] text-muted-foreground">
          lisbon_itinerary_FINAL_v4.txt
        </div>
      </div>

      <Bubble className="bottom-1.5 left-[22px] max-w-[250px] -rotate-[3deg]">
        i&apos;ll pay everyone back later i promise
      </Bubble>
    </div>
  );
}

function Bubble({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "border-hairline bg-surface shadow-float absolute rounded-[16px_16px_16px_5px] border px-4 py-[13px] text-[14.5px] text-[oklch(0.35_0.006_90)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
