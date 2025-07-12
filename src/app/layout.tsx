import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "./components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '700', '900'], // Sesuaikan dengan berat font yang Anda butuhkan
  variable: '--font-montserrat', // Mendefinisikan CSS Variable
});

export const metadata: Metadata = {
  title: "SILAP - Satu Aplikasi Untuk Semua",
  description: "Buang sampah sat set ya pakai SILAP!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        <Navbar /> 
        <main>{children}</main>
      </body>
    </html>
  );
}