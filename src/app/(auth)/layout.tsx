"use client";

import { Container, Row, Col } from "react-bootstrap";
import styles from "./auth.module.css";
import Header from "../components/Large/Navbar/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutContainer}>
      <Header theme="light" />
      <div className={styles.authWrapper}>
        <Container fluid className={`${styles.containerCustom}`}>
          <Row className={`${styles.page}`}>
            <Col
              xs={11}
              sm={8}
              md={6}
              lg={4}
              className={`p-4 rounded ${styles.authCard}`}
            >
              {children}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}