import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      className={`h-full scroll-smooth ${inter.variable}`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
