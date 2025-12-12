"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./auth.module.css";
import Header from "../components/Large/Navbar/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <Header theme="light" />
      <main className={styles.authMain}>{children}</main>
    </div>
  );
}
