'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

import { FaBars, FaBell } from 'react-icons/fa';
import Sidebar from '../components/Large/Sidebar/Sidebar';

import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const breadcrumbParts = pathname.split('/').filter(part => part);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.dashboardContainer}>
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Content Area */}
      <div className={styles.contentWrapper}>
        <header className={styles.mainHeader}>
          <button className={styles.hamburgerButton} onClick={toggleSidebar}>
            <FaBars />
          </button>

          <nav className={styles.breadcrumbs} aria-label="breadcrumb">
            {breadcrumbParts.map((part, index) => {
              const href = '/' + breadcrumbParts.slice(0, index + 1).join('/');
              const isLast = index === breadcrumbParts.length - 1;
              return (
                <React.Fragment key={href}>
                  {isLast ? (
                    <span className={styles.breadcrumbActive}>{capitalize(part)}</span>
                  ) : (
                    <Link href={href} className={styles.breadcrumbLink}>{capitalize(part)}</Link>
                  )}
                  {!isLast && <span className={styles.breadcrumbSeparator}>&gt;</span>}
                </React.Fragment>
              );
            })}
          </nav>

          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <FaBell />
            </button>
          </div>
        </header>
        <main className={styles.pageContent}>
          <Toaster 
            position="top-center" 
            reverseOrder={false}
          />
          {children}
        </main>
      </div>
    </div>
  );
}