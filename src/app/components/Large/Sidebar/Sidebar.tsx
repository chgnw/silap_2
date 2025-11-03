'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { MdDashboard } from "react-icons/md";
import { IoIosGift } from "react-icons/io";
import { FaRankingStar } from "react-icons/fa6";
import { 
  FaCalendar,
  FaHandHoldingUsd,
  FaHistory,
  FaTimes,
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';
import styles from './sidebar.module.css';

type DashboardSidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function DashboardSidebar({ isOpen, toggleSidebar }: DashboardSidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 900) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <a href="/" className={styles.sidebarLogo}>
          <Image src="/assets/logo-silap-dashboard.svg" alt="SILAP Logo" width={120} height={60} />
        </a>
        <button className={styles.closeButton} onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>
      
      <nav className={styles.sidebarNav}>
        <Link 
          href="/dashboard" 
          className={`${styles.navLink} ${
            pathname === '/dashboard' ? styles.isSelected : ''
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <MdDashboard size={24}/>
          </div>
          <span>Dashboard</span>
        </Link>
        <Link href="/dashboard/pickup" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <FaCalendar size={24}/>
          </div>
          <span>Jadwal Pick Up</span>
        </Link>
        <Link href="/dashboard/donation" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <FaHandHoldingUsd size={24}/>
          </div>
          <span>Donasi</span>
        </Link>
        <Link href="/dashboard/point" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <IoIosGift size={24}/>
          </div>
          <span>Point & Reward</span>
        </Link>
        <Link href="/dashboard/history" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <FaHistory size={24}/>
          </div>
          <span>History</span>
        </Link>
        <Link href="/dashboard/profile" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <FaUser size={24}/>
          </div>
          <span>Profile</span>
        </Link>
        <Link href="/dashboard/rangking" className={styles.navLink} onClick={toggleSidebar}>
          <div className={styles.iconContainer}>
            <FaRankingStar size={24}/>
          </div>
          <span>Ranking</span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}