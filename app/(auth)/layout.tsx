import { Wordmark } from "@/components/ui/wordmark";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5.5 py-14">
      <div className="w-full max-w-[380px]">
        <Wordmark className="mb-9 justify-center" />
        {children}
      </div>
    </main>
  );
}
