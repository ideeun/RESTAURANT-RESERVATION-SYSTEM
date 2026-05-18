import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "French Touch — Бронирование",
  description: "Забронируйте столик в ресторане French Touch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans`}>
        <div className="app-page flex min-h-screen flex-col pb-20">
          <Navbar />
          <main className="flex-1 px-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
