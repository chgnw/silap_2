'use client';

import { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import Image from 'next/image';
import { FaUser } from "react-icons/fa";
import styles from './navbar.module.css';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';


type HeaderProps = {
  theme?: 'light' | 'dark';
};

export default function Header({ theme = 'dark' }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const navLinkClass = theme === 'light' ? styles.navLinkLight : styles.navLinkDark;
  const bootstrapVariant = theme === 'light' ? 'dark' : 'light';
  const logoStyle = theme === 'light' ? { filter: 'brightness(0) invert(1)' } : {};

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };


  return (
    <>
      <Navbar expand="lg" variant={bootstrapVariant}>
        <div className={styles.container}>
          <Navbar.Brand href="/">
            <img src="/assets/logo-silap.png" alt="SILAP Logo" className={styles.logoStyle} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${styles.menu} ${navLinkClass}`}>
              {theme === 'dark' ? (
                <>
                  <Nav.Link href="/" className="fw-bold">HOME</Nav.Link>
                  <Nav.Link href="#services" className="fw-bold">SERVICES</Nav.Link>
                  <Nav.Link href="#order" className="fw-bold">ORDER</Nav.Link>
                  <Nav.Link href="#history" className="fw-bold">HISTORY</Nav.Link>
                  {status === 'authenticated' ? (
                    <NavDropdown title={`${session?.user?.first_name} ${session?.user?.last_name}` || 'User'} id="basic-nav-dropdown" className={`${styles.login} fw-bold`}>
                      <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Nav.Link href="/login" className={`${styles.login} fw-bold`}>
                      <FaUser size={12}/> LOGIN
                    </Nav.Link>
                  )}
                </>
              ) : (
                <>
                  {/* Menu Halaman Auth */}
                  <Nav.Link href="/" className="fw-bold">HOME</Nav.Link>
                  <Nav.Link href={isLoginPage ? "/register" : "/login"} className={`${styles.login} fw-bold`}>
                    <FaUser size={12}/> {isLoginPage ? 'REGISTER' : 'LOGIN'}
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
}