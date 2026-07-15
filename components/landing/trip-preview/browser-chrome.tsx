/** Decorative browser frame around the trip preview. */
export function BrowserChrome({ url }: Readonly<{ url: string }>) {
  return (
    <div
      aria-hidden
      className="bg-surface-sunken flex h-11 items-center gap-2 border-b border-[oklch(0.94_0.004_90)] px-[18px]"
    >
      <span className="size-[11px] rounded-full bg-[oklch(0.85_0.06_25)]" />
      <span className="size-[11px] rounded-full bg-[oklch(0.88_0.07_90)]" />
      <span className="size-[11px] rounded-full bg-[oklch(0.85_0.07_150)]" />
      <div className="flex flex-1 justify-center">
        <div className="text-subtle-foreground rounded-[7px] bg-[oklch(0.96_0.004_90)] px-8 py-1 text-[12.5px] min-[560px]:px-16">
          {url}
        </div>
      </div>
    </div>
  );
}
