import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "STOCK ANALYZE PLATFORM",
  description: "A platform for analyzing stock data efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
