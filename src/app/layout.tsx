import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "./components/Large/Navbar/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '700', '900'],
  variable: '--font-montserrat',
});

// SESUDAH
export const metadata: Metadata = {
  title: "SILAP - Satu Aplikasi Untuk Semua",
  icons: {
    icon: '/assets/logo-silap.png',
  },
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