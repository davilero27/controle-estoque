import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

// Fontes do projeto carregadas via next/font para otimização automática
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockPro — Sistema de Estoque",
  description: "Controle de estoque, vendas e analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // As variáveis CSS das fontes são injetadas no <html> para ficarem disponíveis globalmente
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>

        <AuthProvider>
          {children}

          <Toaster
            position="top-right"
            richColors
            theme="dark"
          />
        </AuthProvider>

      </body>
    </html>
  );
}
