"use client";

import { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import styles from "./navbar.module.css";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import SilapLogo from "../../Icons/SilapLogo";

type HeaderProps = {
  theme?: "light" | "dark";
};

export default function Header({ theme = "dark" }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  // Determine Page Type for Menu Content
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLoginPage = pathname === "/login";

  // Scroll Logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme Overrides: specific pages should always use light theme (white text)
  const isLightPage = ["/services", "/pricing", "/about"].includes(pathname);
  const baseTheme = isLightPage ? "light" : theme;

  // Force "light" theme (white text/logo) when scrolled because background becomes dark green
  const effectiveTheme = isScrolled ? "light" : baseTheme;

  const navLinkClass =
    effectiveTheme === "light" ? styles.navLinkLight : styles.navLinkDark;
  const bootstrapVariant = effectiveTheme === "light" ? "dark" : "light";
  const logoColor = effectiveTheme === "light" ? "#FFFFFF" : "#a4b465";

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled (for glass effect)
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine visibility
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px -> Hide
        setIsVisible(false);
      } else {
        // Scrolling up -> Show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const navbarClasses = `
    ${styles.navbarWrapper} 
    ${isScrolled ? styles.scrolled : ''} 
    ${!isVisible ? styles.hidden : ''}
  `;

  return (
    <div className={navbarClasses}>
      <Navbar expand="lg" variant={bootstrapVariant} className={styles.bsNavbar}>
        <div className={styles.container}>
          <Navbar.Brand href="/">
            <SilapLogo color={logoColor} width={45} height={45} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${styles.menu} ${navLinkClass}`}>
              {!isAuthPage ? (
                <>
                  <Nav.Link href="/" className="fw-bold">
                    HOME
                  </Nav.Link>
                  <Nav.Link href="/services" className="fw-bold">
                    SERVICES
                  </Nav.Link>
                  <Nav.Link href="/pricing" className="fw-bold">
                    PRICING
                  </Nav.Link>
                  <Nav.Link href="/about" className="fw-bold">
                    ABOUT
                  </Nav.Link>
                  {status === "authenticated" ? (
                    <NavDropdown
                      title={
                        `${session?.user?.first_name} ${session?.user?.last_name}` ||
                        "User"
                      }
                      id="basic-nav-dropdown"
                      className={`${styles.login} fw-bold`}
                    >
                      <NavDropdown.Item href="#profile">
                        Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleLogout}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Nav.Link
                      href="/login"
                      className={`${styles.login} fw-bold`}
                    >
                      <FaUser size={12} /> LOGIN
                    </Nav.Link>
                  )}
                </>
              ) : (
                <>
                  {/* Menu Halaman Auth */}
                  <Nav.Link href="/" className="fw-bold">
                    HOME
                  </Nav.Link>
                  <Nav.Link
                    href={isLoginPage ? "/register" : "/login"}
                    className={`${styles.login} fw-bold`}
                  >
                    <FaUser size={12} /> {isLoginPage ? "REGISTER" : "LOGIN"}
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </div>
  );
}
/* Navbar */