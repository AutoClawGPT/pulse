import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const ibm = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PULSE",
  description: "Devnet prediction pit. Odds + levered pulse on pump.fun prints.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${ibm.variable} h-full`}>
      <body className="min-h-full bg-[var(--bg)] text-[var(--ink)]">
        <a className="skip" href="#main">
          Skip to pit
        </a>
        <Providers>{children}</Providers>
        <div className="scanlines" aria-hidden />
        <div className="noise" aria-hidden />
      </body>
    </html>
  );
}
