import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { scriptDeTema } from "./tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reportero CSC — cierre mensual de tickets",
  description:
    "Del export de Halo al informe mensual del cliente: metricas, graficas y documento, sin transcribir cifras a mano.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Antes del primer pintado, para que recargar en oscuro no destelle blanco. */}
        <script dangerouslySetInnerHTML={{ __html: scriptDeTema }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
