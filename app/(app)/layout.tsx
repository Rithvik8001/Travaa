import { Dock } from "@/components/app/dock";

/** The signed-in surface: content plus the floating macOS-style dock. */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Dock />
    </>
  );
}
