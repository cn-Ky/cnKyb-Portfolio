import type { Metadata } from "next";
import { Anton, Special_Elite } from "next/font/google";
import "./globals.css";
const title = Anton({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--f-title" });
const type = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--f-type" });
export const metadata: Metadata = { title: "Ky — Full-Stack Geliştirici", description: "Projelerim ve iş teklifi formu." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="tr" className={`${title.variable} ${type.variable}`}><body className="font-type antialiased">{children}</body></html>);
}
