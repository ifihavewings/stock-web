import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "股票数据系统",
  description: "股票数据查询和分析系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        {children}
      </body>
    </html>
  );
}
