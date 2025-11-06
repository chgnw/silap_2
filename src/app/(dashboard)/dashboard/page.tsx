"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';

import { FaFilter, FaCalendar } from "react-icons/fa";
import "flatpickr/dist/themes/airbnb.css";

import { GiDeerHead, GiBirdTwitter, GiElephant } from "react-icons/gi";
import styles from "../dashboard.module.css";

export default function DashboardPage() {
  const { data: session } = useSession();

  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [placeholder, setPlaceholder] = useState("Pilih Rentang Tanggal");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDashboardData = async (userId: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/getUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          start_date: start,
          end_date: end,
        }),
      });

      const data = await res.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error("Fetch dashboard failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pertama (default 1 bulan terakhir)
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData(session.user.id);
    }
  }, [session]);

  // Fetch ulang kalau tanggal berubah
  useEffect(() => {
    if (session?.user?.id && dateRange.length === 2) {
      const [start, end] = dateRange;
      fetchDashboardData(
        session.user.id,
        start?.toISOString().split("T")[0],
        end?.toISOString().split("T")[0]
      );
    }
  }, [dateRange, session]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value ? new Date(e.target.value) : null;
    setDateRange([newStart, dateRange[1]]);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value ? new Date(e.target.value) : null;
    setDateRange([dateRange[0], newEnd]);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    if (session?.user?.id) fetchDashboardData(session.user.id);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.topRow}>
        {/* Filter tanggal */}
        <section className={styles.filterSection}>
          <div className={styles.filterSectionHeader}>
            <FaFilter size={16}/>
            <span>Filter</span>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>
              <FaCalendar size={16} /> Tanggal
            </span>

            <div className={styles.filterContainer}>
              <div>
                <label className={styles.filterLabel}>Tanggal Mulai:</label>
                <input
                  type="date"
                  max={today}
                  className={styles.filterInput}
                  value={dateRange[0] ? dateRange[0].toISOString().split("T")[0] : ""}
                  onChange={handleStartDateChange}
                />
              </div>

              <div>
                <label className={styles.filterLabel}>Tanggal Akhir:</label>
                <input
                  type="date"
                  max={today}
                  className={styles.filterInput}
                  value={dateRange[1] ? dateRange[1].toISOString().split("T")[0] : ""}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            {(dateRange[0] || dateRange[1]) && (
              <button
                className={styles.resetButton}
                type="button"
                onClick={handleReset}
              >
                Reset Filter
              </button>
            )}
          </div>
        </section>

        <section className={styles.tierSection}>
          {session?.user?.tier_list_id === 1 ? (
            <GiDeerHead size={80} style={{color: '#A4B465'}}/>
          ) : session?.user?.tier_list_id === 2 ? (
            <GiBirdTwitter size={80} style={{color: '#42D4F5'}}/>
          ) : session?.user?.tier_list_id === 3 ? (
            <GiElephant size={80} style={{color: '#ED1C24'}}/>
          ) : null}

          <div className={styles.userTier}>
            <h1>{`${session?.user?.first_name} ${session?.user?.last_name}` || 'Pengguna'}</h1>
            <span>
              {session?.user?.tier_list_name}
            </span>
          </div>
        </section>
      </div>

      <div className={styles.secondRow}>
        {loading ? (
          <p>Memuat data...</p>
        ) : dashboardData ? (
          <div>
            <p><strong>Total Sampah:</strong> {dashboardData.total_waste}</p>
            <p><strong>Perubahan Poin:</strong> {dashboardData.points_change}</p>
            <p><strong>Streak Harian:</strong> {dashboardData.current_streak}</p>
            <p><strong>Kategori:</strong> {dashboardData.categories.length} item</p>
            <p><strong>Data Harian:</strong> {dashboardData.daily.length} hari</p>
          </div>
        ) : (
          <p>Tidak ada data</p>
        )}
      </div>
    </div>
  );
}