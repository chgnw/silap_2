"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./auth.module.css";
import Header from "../components/Large/Navbar/Navbar";

import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  return (
    <div
      className={`${styles.layoutContainer} ${isRegister ? styles.registerBackground : styles.loginBackground
        }`}
    >
      <Header theme="light" />
      <main className={styles.authMain}>{children}</main>
    </div>
  );
}
