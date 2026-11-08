import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Noto_Serif_Devanagari } from "next/font/google";
import { AppLanguageProvider } from "@/components/language/AppLanguageProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-base",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hindi-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "आपके आगमन की प्रतीक्षा रहेगी / We Look Forward to Celebrating With You",
  description: "Wedding guest details and family information for a warm celebration / शादी के मेहमानों के लिए परिवार का विवरण",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${cormorant.variable} ${dmSans.variable} ${notoSerifDevanagari.variable}`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppLanguageProvider>{children}</AppLanguageProvider>
      </body>
    </html>
  );
}
