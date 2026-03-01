import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "./providers/QueryProvider";

import MainNavbar from "@/components/MainNavbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitor de Estudos",
  description: "Acompanhe suas sessões de estudo, visualize seu progresso e otimize seu tempo de aprendizado com o Monitor de Estudos. Registre suas atividades, defina metas e mantenha-se motivado para alcançar seus objetivos acadêmicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <QueryProvider>
          <MainNavbar />
          {children}
          <Toaster position="top-right" />

        </QueryProvider>
      </body>
    </html>
  );
}
