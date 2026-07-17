/** Decorative browser frame around the trip preview. */
export function BrowserChrome({ url }: Readonly<{ url: string }>) {
  return (
    <div
      aria-hidden
      className="bg-surface-sunken border-hairline flex h-11 items-center gap-2 border-b px-[18px]"
    >
      <span className="size-[10px] rounded-full bg-[oklch(0.86_0_0)]" />
      <span className="size-[10px] rounded-full bg-[oklch(0.86_0_0)]" />
      <span className="size-[10px] rounded-full bg-[oklch(0.86_0_0)]" />
      <div className="flex flex-1 justify-center">
        <div className="text-subtle-foreground bg-surface border-hairline rounded-[7px] border px-8 py-1 text-[12.5px] min-[560px]:px-16">
          {url}
        </div>
      </div>
    </div>
  );
}
