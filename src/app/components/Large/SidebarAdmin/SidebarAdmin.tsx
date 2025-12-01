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
  FaHistory,
  FaTimes,
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';
import styles from './sidebarAdmin.module.css';

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
          href="/admin" 
          className={`${styles.navLink} ${
            pathname === '/admin' ? styles.isSelected : ''
          }`}
          onClick={handleLinkClick}
        >
          <div className={styles.iconContainer}>
            <MdDashboard size={24}/>
          </div>
          <span>Home</span>
        </Link>
        
        <Link href="/admin/waste" 
          className={`${styles.navLink} ${
            pathname === '/admin/waste' ? styles.isSelected : ''
          }`} 
          onClick={handleLinkClick}>
          <div className={styles.iconContainer}>
            <FaCalendar size={24}/>
          </div>
          <span>Master Waste</span>
        </Link>

        <Link href="/admin/rewards" className={`${styles.navLink} ${
            pathname === '/admin/rewards' ? styles.isSelected : ''
          }`} 
          onClick={handleLinkClick}>
          <div className={styles.iconContainer}>
            <IoIosGift size={24}/>
          </div>
          <span>Master Reward</span>
        </Link>

        <Link href="/admin/vehicles" className={`${styles.navLink} ${
            pathname === '/admin/vehicles' ? styles.isSelected : ''
          }`} 
          onClick={handleLinkClick}>
          <div className={styles.iconContainer}>
            <FaHistory size={24}/>
          </div>
          <span>Master Vehicle</span>
        </Link>

        <Link href="/admin/others" className={`${styles.navLink} ${
            pathname === '/admin/others' ? styles.isSelected : ''
          }`} 
          onClick={handleLinkClick}>
          <div className={styles.iconContainer}>
            <FaRankingStar size={24}/>
          </div>
          <span>Other Configuration</span>
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