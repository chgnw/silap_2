"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { FaUser, FaCalendar, FaTimes, FaSignOutAlt } from "react-icons/fa";
import styles from "./sidebarDriver.module.css";

type DashboardSidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function SidebarDriver({
  isOpen,
  toggleSidebar,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 900) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarHeader}>
        <a href="/" className={styles.sidebarLogo}>
          <Image
            src="/assets/logo-silap-dashboard.svg"
            alt="SILAP Logo"
            width={120}
            height={60}
          />
        </a>
        <button className={styles.closeButton} onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <Link
          href="/driver"
          className={`${styles.navLink} ${
            pathname === "/driver" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <AiOutlineThunderbolt size={24} />
          </div>
          <span>Siap Pick Up</span>
        </Link>

        <Link
          href="/driver/orders"
          className={`${styles.navLink} ${
            pathname === "/driver/orders" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaCalendar size={24} />
          </div>
          <span>Order Pick Up</span>
        </Link>

        <Link
          href="/driver/profile"
          className={`${styles.navLink} ${
            pathname === "/driver/profile" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaUser size={24} />
          </div>
          <span>Profile</span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          onClick={handleLogout}
          className={`${styles.navLink} ${styles.logoutButton}`}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
