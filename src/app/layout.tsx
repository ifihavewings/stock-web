import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from '@/theme/ThemeProvider'
import StyledJsxRegistry from '@/lib/registry'

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
        <StyledJsxRegistry>
          <ThemeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
