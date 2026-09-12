import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const SCRIPT_TEMA_INICIAL = `
  (function () {
    try {
      var guardado = window.localStorage.getItem("tema");
      var oscuro = guardado ? guardado === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", oscuro);
      document.documentElement.style.colorScheme = oscuro ? "dark" : "light";
    } catch (e) {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reporte Mensual SOC",
  description: "Generador automático del reporte mensual SOC a partir del export de Halo ITSM",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="tema-inicial" strategy="beforeInteractive">
          {SCRIPT_TEMA_INICIAL}
        </Script>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
