import { AuthAside } from "@/components/auth/auth-aside";
import { Wordmark } from "@/components/ui/wordmark";

/**
 * Split-screen auth: the form sits on the paper canvas at left, a branded product
 * panel fills the right at desktop widths. On small screens the aside drops away
 * and the form takes the full column.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-full flex-1 min-[900px]:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col justify-center px-6 py-24 min-[560px]:px-10 min-[900px]:px-14">
        <Wordmark className="absolute top-8 left-6 min-[560px]:left-10 min-[900px]:left-14" />
        <div className="animate-pop mx-auto w-full max-w-[368px]">{children}</div>
      </div>
      <AuthAside />
    </main>
  );
}
