import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "指示書ジェネレーター | Shijisho Generator",
  description: "テキストベースの修正指示から、矢印付きの視覚的な指示書を自動生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
