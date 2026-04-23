import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapSaarthi | Enterprise Image Intelligence",
  description: "Empowering businesses with modern image orchestration and AI-driven insights. Built for scale, designed for excellence.",
};

import { ToastProvider } from "../components/Toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <ToastProvider>
          <div className="hero-gradient fixed inset-0 z-[-1]" />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
