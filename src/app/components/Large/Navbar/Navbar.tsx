'use client';

import { Navbar, Nav, Container } from 'react-bootstrap';
import Image from 'next/image';
import { FaUser } from "react-icons/fa";
import styles from './navbar.module.css'

export default function Header() {
  return (
    <Navbar expand="lg" bg="white" variant="light" className="py-3">
      <Container>
        <Navbar.Brand href="#home">
          <Image src="/assets/logo-silap.png" alt="SILAP Logo" width={30} height={30} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={`ms-auto ${styles.menu}`}>
            <Nav.Link href="#beranda" className="fw-bold">BERANDA</Nav.Link>
            <Nav.Link href="#pesanan" className="fw-bold">PESANAN</Nav.Link>
            <Nav.Link href="#riwayat" className="fw-bold">RIWAYAT</Nav.Link>
            <Nav.Link href="#login" className={`${styles.login} fw-bold`}>
              <FaUser size={12}/>
              LOGIN
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}