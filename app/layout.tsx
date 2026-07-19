import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Travaa — Plan the trip in one place",
    template: "%s · Travaa",
  },
  description:
    "Dates, ideas, the itinerary, and who paid for what — decided together on one shared grid. Travaa turns “we should totally do this” into an actual trip.",
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
      className={`h-full scroll-smooth ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
