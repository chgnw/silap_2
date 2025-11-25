"use client";

import { usePathname } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./auth.module.css";
import Header from "../components/Large/Navbar/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegisterPage = pathname?.includes("/register");

  return (
    <div
      className={`${styles.layoutContainer} ${
        isRegisterPage ? styles.registerBg : styles.loginBg
      }`}
    >
      <Header theme="light" />
      <div className={styles.authWrapper}>
        <Container fluid className={styles.containerCustom}>
          <Row className={styles.row}>
            <Col className={styles.authCard}>{children}</Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}