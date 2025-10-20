"use client";

import { Navbar, Nav, Container, Row, Col } from "react-bootstrap";
import Image from 'next/image';
import { FaUser } from "react-icons/fa";
import "./auth.module.css";
import styles from "./auth.module.css";
import { collectRoutesUsingEdgeRuntime } from "next/dist/build/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutContainer}>
      <Navbar expand="lg" className={`${styles.navbar}`}>
        <Container>
          <Navbar.Brand href="/" style={{color: "white"}}>
            <Image src="/assets/logo-silap.png" alt="SILAP Logo" width={30} height={40} style={{ filter: 'brightness(0) invert(1)' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${styles.menu}`}>
              <Nav.Link href="/" className="fw-bold">HOME</Nav.Link>
              <Nav.Link href="/register" className={`${styles.login} fw-bold`}>
                <FaUser size={12}/>
                REGISTER
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

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
