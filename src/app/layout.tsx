import type { Metadata } from "next";
import "./globals.css";
import "../../styles.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "TIPOCA — Operationalizing AI in Healthcare",
  description: "TIPOCA Research Initiative",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
