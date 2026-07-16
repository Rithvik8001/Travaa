import { Wordmark } from "@/components/ui/wordmark";

/**
 * Single focused column, vertically centered. Mirrors the join/deep-link screen
 * in Travaa.dc.html — the app's established pattern for a one-decision page.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="animate-pop w-full max-w-[400px]">
        <Wordmark className="mb-7 justify-center" />
        {children}
      </div>
    </main>
  );
}
