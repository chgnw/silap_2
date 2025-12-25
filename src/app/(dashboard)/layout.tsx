"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { FaBars, FaBell } from "react-icons/fa";
import Sidebar from "../components/Large/Sidebar/Sidebar";
import FullPageSpinner from "../components/Large/Spinner/Spinner";

import styles from "./dashboard.module.css";

const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const hasCheckedRef = useRef(false);
  const pathname = usePathname();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const breadcrumbParts = useMemo(
    () => pathname.split("/").filter((part) => part),
    [pathname]
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Auto-close/open sidebar on window resize based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  // Check subscription status when accessing dashboard
  useEffect(() => {
    const checkSubscription = async () => {
      if (sessionStatus !== "authenticated" || !session?.user?.id) return;
      if (hasCheckedRef.current) return;

      hasCheckedRef.current = true;

      try {
        const response = await fetch("/api/dashboard/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: session.user.id }),
        });

        const result = await response.json();

        if (result.status === "not_subscribed") {
          // No subscription and no pending payment -> block ALL dashboard pages
          router.push("/pricing");
          return;
        }

        // For both "subscribed" and "pending_payment":
        // - subscribed: allow all pages
        // - pending_payment: allow all pages EXCEPT pickup (handled in pickup/page.tsx)
        setIsAllowed(true);
      } catch (error) {
        console.error("Error checking subscription:", error);
        // On error, allow access (fail open)
        setIsAllowed(true);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [sessionStatus, session?.user?.id, pathname, router]);

  // Show loading while checking session or subscription
  if (sessionStatus === "loading" || isCheckingSubscription) {
    return <FullPageSpinner message="Memuat dashboard, mohon menunggu..." />;
  }

  // Don't render if not allowed (redirect happening)
  if (!isAllowed && pathname !== "/dashboard/profile") {
    return <FullPageSpinner message="Mengalihkan..." />;
  }

  return (
    <div className={styles.dashboardContainer}>
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Content Area */}
      <div className={styles.contentWrapper}>
        <header className={styles.mainHeader}>
          <div className={styles.headerLeft}>
            <button
              className={`${styles.hamburgerButton} ${!isSidebarOpen ? styles.hamburgerShow : ""
                }`}
              onClick={toggleSidebar}
            >
              <FaBars />
            </button>

            <nav className={styles.breadcrumbs} aria-label="breadcrumb">
              {breadcrumbParts.map((part, index) => {
                const href = "/" + breadcrumbParts.slice(0, index + 1).join("/");
                const isLast = index === breadcrumbParts.length - 1;
                return (
                  <React.Fragment key={href}>
                    {isLast ? (
                      <span className={styles.breadcrumbActive}>
                        {capitalize(part)}
                      </span>
                    ) : (
                      <Link href={href} className={styles.breadcrumbLink}>
                        {capitalize(part)}
                      </Link>
                    )}
                    {!isLast && (
                      <span className={styles.breadcrumbSeparator}>&gt;</span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <FaBell />
            </button>
          </div>
        </header>
        <main className={styles.pageContent}>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </main>
      </div>
    </div>
  );
}