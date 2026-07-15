import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "Travaa — Plan together, decide faster, travel better",
    template: "%s · Travaa",
  },
  description:
    "Dates, ideas, the itinerary, and who-paid-for-what — all in one quiet place. Travaa turns “we should totally do this” into actual boarding passes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full scroll-smooth", newsreader.variable)}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
