"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaUser, FaHome, FaRecycle, FaGift, FaTruck, FaCogs, FaTimes, FaSignOutAlt } from "react-icons/fa";
import styles from "./sidebarAdmin.module.css";

type DashboardSidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function DashboardSidebar({ isOpen, toggleSidebar }: DashboardSidebarProps) {
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
          href="/admin"
          className={`${styles.navLink} ${
            pathname === "/admin" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaHome size={24} />
          </div>
          <span>Home</span>
        </Link>

        <Link
          href="/admin/admins"
          className={`${styles.navLink} ${
            pathname === "/admin/admins" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaUser size={24} />
          </div>
          <span>Admin Management</span>
        </Link>

        <Link
          href="/admin/waste"
          className={`${styles.navLink} ${
            pathname === "/admin/waste" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaRecycle size={24} />
          </div>
          <span>Waste Data</span>
        </Link>

        <Link
          href="/admin/rewards"
          className={`${styles.navLink} ${
            pathname === "/admin/rewards" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaGift size={24} />
          </div>
          <span>Reward Data</span>
        </Link>

        <Link
          href="/admin/drivers-vehicles"
          className={`${styles.navLink} ${
            pathname === "/admin/drivers-vehicles" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaTruck size={24} />
          </div>
          <span>Driver & Vehicle</span>
        </Link>

        <Link
          href="/admin/others"
          className={`${styles.navLink} ${
            pathname === "/admin/others" ? styles.isSelected : ""
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <FaCogs size={24} />
          </div>
          <span>Others</span>
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