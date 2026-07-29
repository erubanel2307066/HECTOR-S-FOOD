import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hector's - Comida a Domicilio",
  description: "Comida casera, rápida y deliciosa. Entregamos a tu oficina o casa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={`min-h-full bg-background text-foreground antialiased ${manrope.variable} ${playfair.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
