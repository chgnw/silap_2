"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaUser,
  FaHome,
  FaRecycle,
  FaGift,
  FaTruck,
  FaCogs,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState, useTransition } from "react";
import styles from "./sidebarAdmin.module.css";

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
          href="/admin"
          className={`${styles.navLink} ${
            pathname === "/admin" ? styles.isSelected : ""
          } ${loadingPath === "/admin" && isPending ? styles.loading : ""}`}
          onClick={handleLinkClick("/admin")}
        >
          <div className={styles.iconContainer}>
            <FaHome size={24} />
          </div>
          <span>Home</span>
          {loadingPath === "/admin" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/admin/admins"
          className={`${styles.navLink} ${
            pathname === "/admin/admins" ? styles.isSelected : ""
          } ${
            loadingPath === "/admin/admins" && isPending ? styles.loading : ""
          }`}
          onClick={handleLinkClick("/admin/admins")}
        >
          <div className={styles.iconContainer}>
            <FaUser size={24} />
          </div>
          <span>Admin Management</span>
          {loadingPath === "/admin/admins" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/admin/waste"
          className={`${styles.navLink} ${
            pathname === "/admin/waste" ? styles.isSelected : ""
          } ${
            loadingPath === "/admin/waste" && isPending ? styles.loading : ""
          }`}
          onClick={handleLinkClick("/admin/waste")}
        >
          <div className={styles.iconContainer}>
            <FaRecycle size={24} />
          </div>
          <span>Waste Data</span>
          {loadingPath === "/admin/waste" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/admin/rewards"
          className={`${styles.navLink} ${
            pathname === "/admin/rewards" ? styles.isSelected : ""
          } ${
            loadingPath === "/admin/rewards" && isPending ? styles.loading : ""
          }`}
          onClick={handleLinkClick("/admin/rewards")}
        >
          <div className={styles.iconContainer}>
            <FaGift size={24} />
          </div>
          <span>Reward Data</span>
          {loadingPath === "/admin/rewards" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/admin/drivers-vehicles"
          className={`${styles.navLink} ${
            pathname === "/admin/drivers-vehicles" ? styles.isSelected : ""
          } ${
            loadingPath === "/admin/drivers-vehicles" && isPending
              ? styles.loading
              : ""
          }`}
          onClick={handleLinkClick("/admin/drivers-vehicles")}
        >
          <div className={styles.iconContainer}>
            <FaTruck size={24} />
          </div>
          <span>Driver & Vehicle</span>
          {loadingPath === "/admin/drivers-vehicles" && isPending && (
            <div className={styles.loadingSpinner}></div>
          )}
        </Link>

        <Link
          href="/admin/others"
          className={`${styles.navLink} ${
            pathname === "/admin/others" ? styles.isSelected : ""
          } ${
            loadingPath === "/admin/others" && isPending ? styles.loading : ""
          }`}
          onClick={handleLinkClick("/admin/others")}
        >
          <div className={styles.iconContainer}>
            <FaCogs size={24} />
          </div>
          <span>Others</span>
          {loadingPath === "/admin/others" && isPending && (
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
