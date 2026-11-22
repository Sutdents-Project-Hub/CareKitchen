import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sourceSerif = localFont({
  src: "./fonts/sourceserif4-latin.woff2",
  weight: "400 700",
  variable: "--source-serif",
  adjustFontFallback: "Times New Roman",
  display: "swap",
});

const ibmPlex = localFont({
  src: "./fonts/ibmplexsans-latin.woff2",
  weight: "400 700",
  variable: "--ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareKitchen｜家常餐點規劃",
  description: "依手邊食材、預算與已確認的飲食限制規劃一餐。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hant"
      className={sourceSerif.variable + " " + ibmPlex.variable}
    >
      <body>{children}</body>
    </html>
  );
}
