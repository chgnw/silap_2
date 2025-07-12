'use client';

import { Navbar, Nav, Container } from 'react-bootstrap';
import Image from 'next/image';
import { FaUser } from "react-icons/fa";
import styles from './components.module.css'

export default function Header() {
  return (
    <Navbar expand="lg" bg="white" variant="light" className="py-3">
      <Container>
        <Navbar.Brand href="#home">
          <Image src="/images/logo-silap.png" alt="SILAP Logo" width={40} height={40} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={`ms-auto ${styles.menu}`}>
            <Nav.Link href="#beranda" className="fw-bold">BERANDA</Nav.Link>
            <Nav.Link href="#order" className="fw-bold">ORDER</Nav.Link>
            <Nav.Link href="#history" className="fw-bold">HISTORY</Nav.Link>
            <Nav.Link href="#login" className={`${styles.login} fw-bold`}>
              <FaUser size={16}/>
              LOGIN
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}