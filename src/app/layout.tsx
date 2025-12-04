import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import DeviceNotSupported from "./components/Large/Overlay/DeviceNotSupported";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "SILAP - Satu Aplikasi Untuk Semua",
  icons: {
    icon: "/assets/logo-silap.png",
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
        <DeviceNotSupported />
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
