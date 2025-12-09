"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { MdDashboard } from "react-icons/md";
import { IoIosGift } from "react-icons/io";
import {
  FaCalendar,
  FaHistory,
  FaTimes,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState, useTransition } from "react";
import styles from "./sidebar.module.css";

type DashboardSidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function DashboardSidebar({
  isOpen,
  toggleSidebar,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleLinkClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingPath(href);
    startTransition(() => {
      router.push(href);
      if (window.innerWidth <= 900) {
        toggleSidebar();
      }
    });
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
          href="/dashboard"
          className={`${styles.navLink} ${
            pathname === "/dashboard" ? styles.isSelected : ""
          } ${loadingPath === "/dashboard" && isPending ? styles.loading : ""}`}
          onClick={handleLinkClick("/dashboard")}
        >
          <div className={styles.iconContainer}>
            <MdDashboard size={24} />
          </div>
          <span>Dashboard</span>
          {loadingPath === "/dashboard" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/dashboard/pickup"
          className={`${styles.navLink} ${
            pathname === "/dashboard/pickup" ? styles.isSelected : ""
          } ${
            loadingPath === "/dashboard/pickup" && isPending
              ? styles.loading
              : ""
          }`}
          onClick={handleLinkClick("/dashboard/pickup")}
        >
          <div className={styles.iconContainer}>
            <FaCalendar size={24} />
          </div>
          <span>Jadwal Pick Up</span>
          {loadingPath === "/dashboard/pickup" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/dashboard/point"
          className={`${styles.navLink} ${
            pathname === "/dashboard/point" ? styles.isSelected : ""
          } ${
            loadingPath === "/dashboard/point" && isPending
              ? styles.loading
              : ""
          }`}
          onClick={handleLinkClick("/dashboard/point")}
        >
          <div className={styles.iconContainer}>
            <IoIosGift size={24} />
          </div>
          <span>Point & Reward</span>
          {loadingPath === "/dashboard/point" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/dashboard/order"
          className={`${styles.navLink} ${
            pathname === "/dashboard/order" ? styles.isSelected : ""
          } ${
            loadingPath === "/dashboard/order" && isPending
              ? styles.loading
              : ""
          }`}
          onClick={handleLinkClick("/dashboard/order")}
        >
          <div className={styles.iconContainer}>
            <FaHistory size={24} />
          </div>
          <span>Pesanan Saya</span>
          {loadingPath === "/dashboard/order" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/dashboard/profile"
          className={`${styles.navLink} ${
            pathname === "/dashboard/profile" ? styles.isSelected : ""
          } ${
            loadingPath === "/dashboard/profile" && isPending
              ? styles.loading
              : ""
          }`}
          onClick={handleLinkClick("/dashboard/profile")}
        >
          <div className={styles.iconContainer}>
            <FaUser size={24} />
          </div>
          <span>Profile</span>
          {loadingPath === "/dashboard/profile" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
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
