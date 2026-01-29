import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // Updated fonts based on manual
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Center Tecno - Tecnología Especializada",
  description: "Venta de Hardware, PC Builder y Servicio Técnico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
