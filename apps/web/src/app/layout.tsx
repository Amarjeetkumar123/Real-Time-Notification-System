import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotifyHub Dashboard",
  description: "Real-time notification dashboard for the event-driven demo project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
