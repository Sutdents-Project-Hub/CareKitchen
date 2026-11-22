import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareKitchen｜一起好好吃飯",
  description: "依手邊食材、預算與已確認條件，找一餐剛剛好的料理方向。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
