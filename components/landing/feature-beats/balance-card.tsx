/** Beat 03 visual: the trip's money, netted down to two transfers. */
export function BalanceCard() {
  return (
    <div className="border-border bg-surface shadow-lift rounded-[18px] border p-[22px]">
      <div className="mb-4 grid grid-cols-2 gap-[11px]">
        <div className="rounded-[13px] bg-[oklch(0.24_0.006_90)] p-[15px] text-white">
          <div className="mb-[7px] text-[10.5px] font-medium tracking-[0.04em] uppercase opacity-60">
            Total spent
          </div>
          <div className="text-[22px] font-semibold tracking-[-0.02em]">€2,378</div>
        </div>
        <div className="border-hairline bg-surface-sunken rounded-[13px] border p-[15px]">
          <div className="text-subtle-foreground mb-[7px] text-[10.5px] font-semibold tracking-[0.04em] uppercase">
            Your balance
          </div>
          <div className="text-positive text-[22px] font-semibold tracking-[-0.02em]">
            +€64.20
          </div>
        </div>
      </div>

      <p className="text-[15.5px] leading-[1.55] text-muted-foreground">
        So: <b className="text-ink font-semibold">Sam sends you €148</b>,{" "}
        <b className="text-ink font-semibold">you send Diego €96</b> — and everyone
        stops keeping score.
      </p>
    </div>
  );
}
