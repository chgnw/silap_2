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

  const isActive = (path: string) => pathname === path;

  // Scroll Logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isScrolled, setIsScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Theme Overrides: specific pages should always use light theme (white text)
  const isLightPage = ["/", "/services", "/pricing", "/about"].includes(pathname);
  const baseTheme = isLightPage ? "light" : theme;

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    // Initial check
    if (typeof window !== "undefined") {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Force "light" theme (white text/logo) when scrolled OR on mobile because background becomes dark green
  const effectiveTheme = isScrolled || isMobile ? "light" : baseTheme;

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
      if (expanded) return; // Don't hide if menu is expanded

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
  }, [lastScrollY, expanded]);

  // Lock body scroll when menu is expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflowY = "hidden";
      document.body.style.overflowX = "hidden";
    } else {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "hidden";
    }
  }, [expanded]);

  const navbarClasses = `
    ${styles.navbarWrapper} 
    ${isScrolled ? styles.scrolled : ''} 
    ${!isVisible ? styles.hidden : ''}
    ${expanded ? styles.expanded : ''}
  `;

  return (
    <div className={navbarClasses}>
      <Navbar
        expand="lg"
        variant={bootstrapVariant}
        className={styles.bsNavbar}
        expanded={expanded}
        onToggle={(ex) => setExpanded(ex)}
      >
        <div className={styles.container}>
          <Navbar.Brand href="/">
            <SilapLogo color={logoColor} width={45} height={45} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${styles.menu} ${navLinkClass}`}>
              {!isAuthPage ? (
                <>
                  <Nav.Link
                    href="/"
                    className={`fw-bold ${isActive("/") ? styles.activeLink : ""}`}
                  >
                    HOME
                  </Nav.Link>
                  <Nav.Link
                    href="/services"
                    className={`fw-bold ${isActive("/services") ? styles.activeLink : ""}`}
                  >
                    SERVICES
                  </Nav.Link>
                  <Nav.Link
                    href="/pricing"
                    className={`fw-bold ${isActive("/pricing") ? styles.activeLink : ""}`}
                  >
                    PRICING
                  </Nav.Link>
                  <Nav.Link
                    href="/about"
                    className={`fw-bold ${isActive("/about") ? styles.activeLink : ""}`}
                  >
                    ABOUT
                  </Nav.Link>
                  {status === "authenticated" ? (
                    <NavDropdown
                      title={
                        <span className={styles.userNameText}>
                          {`${session?.user?.first_name} ${session?.user?.last_name} ` || "User"}
                        </span>
                      }
                      id="basic-nav-dropdown"
                      className={`${styles.login} ${styles.customDropdown} fw-bold`}
                    >
                      <NavDropdown.Item href="/dashboard">
                        Dashboard
                      </NavDropdown.Item>
                      <NavDropdown.Item href="/dashboard/profile">
                        Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider className={styles.dropdownDivider} />
                      <NavDropdown.Item onClick={handleLogout} className={styles.logoutItem}>
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