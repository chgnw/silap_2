"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

import { FaFilter, FaStar, FaTrash, FaCoins, FaCrown } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
import { PiSigma } from "react-icons/pi";
import { TbTargetArrow } from "react-icons/tb";
import { GiDeerHead, GiBirdTwitter, GiElephant, GiCancel } from "react-icons/gi";
import styles from "../dashboard.module.css";

// --- DYNAMIC IMPORTS ---

// Import komponen PieChart yang baru kita buat (pastikan path file sesuai)
const WastePieChart = dynamic(() => import("../../components/Large/WastePieChart/WastePieChart"), {
  ssr: false,
  loading: () => <div className={styles.chartLoading}>Loading chart...</div>,
});

// Area Chart imports (Line Chart)
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });

// --- CONFIGURATION ---

// Warna Chart (High Contrast untuk Debugging, ganti ke warna hijau jika sudah fix)
const CHART_COLORS = [
  "#2F5E44", "#4B7A59", "#A4B465", "#C3D982",
  "#D6E3A8", "#E8EED0", "#F4F7E7"
];

type PieDataEntry = {
  name: string;
  value: number;
};

type LineDataEntry = {
  date: string;
  value: number;
};

type DashboardData = {
  total_waste: string;
  points_current: number;
  points_last_earned: number;
  current_streak: number;
  streak_active_this_week: boolean;
  waste_target: number;
  total_monthly: number;
  categories: Array<{ category: string; total: string }>;
  daily: Array<{ date: string; total: string }>;
};

type SubscriptionInfo = {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
} | null;

// --- COMPONENTS ---

// Loading skeleton
const LoadingSkeleton = memo(() => (
  <div className={styles.skeletonContainer}>
    <div className={styles.skeletonCircle} />
    <div className={styles.skeletonTextContainer}>
      <div className={styles.skeletonText} />
      <div className={styles.skeletonTextSmall} />
    </div>
  </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

// Filter Section
const FilterSection = memo(
  ({
    dateRange,
    onStartDateChange,
    onEndDateChange,
    onReset,
  }: {
    dateRange: [Date | null, Date | null];
    onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onReset: () => void;
  }) => {
    const today = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }), []);

    return (
      <section className={styles.filterSection}>
        <div className={styles.filterSectionHeader}>
          <FaFilter size={16} />
          <span>Filters</span>
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterInputWrapper}>
            <label className={styles.filterLabel}>Tanggal Mulai:</label>
            <input
              type="date"
              max={today}
              className={styles.filterInput}
              value={dateRange[0] ? dateRange[0].toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) : ""}
              onChange={onStartDateChange}
            />
          </div>
          <div className={styles.filterInputWrapper}>
            <label className={styles.filterLabel}>Tanggal Akhir:</label>
            <input
              type="date"
              max={today}
              className={styles.filterInput}
              value={dateRange[1] ? dateRange[1].toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) : ""}
              onChange={onEndDateChange}
            />
          </div>
        </div>
      </section>
    );
  }
);
FilterSection.displayName = "FilterSection";

// Subscription Card
const SubscriptionCard = memo(
  ({ subscription, loading, hasPendingRenewal }: { subscription: SubscriptionInfo; loading: boolean; hasPendingRenewal: boolean }) => {
    if (loading) {
      return (
        <section className={styles.subscriptionCard}>
          <LoadingSkeleton />
        </section>
      );
    }

    if (!subscription) {
      return (
        <section className={styles.subscriptionCard}>
          <div className={styles.subscriptionCardHeader}>
            <div className={styles.subscriptionCardSymbol}>
              <FaCrown />
            </div>
            <p>Status Langganan</p>
          </div>
          <div className={styles.subscriptionCardContent}>
            <div className={styles.subscriptionCardBody}>
              <h2>Tidak Aktif</h2>
              <span>Anda belum berlangganan</span>
            </div>
            <div className={styles.subscriptionCardFooter}>
              <Link href="/pricing" className={styles.renewButton}>
                Berlangganan
              </Link>
            </div>
          </div>
        </section>
      );
    }

    const isNearExpiry = subscription.days_remaining <= 3;
    const showRenewButton = isNearExpiry && !hasPendingRenewal;
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return (
      <section className={styles.subscriptionCard}>
        <div className={styles.subscriptionCardHeader}>
          <div className={styles.subscriptionCardSymbol}>
            <FaCrown />
          </div>
          <p>Status Langganan</p>
        </div>
        <div className={styles.subscriptionCardContent}>
          <div className={styles.subscriptionCardBody}>
            <h2>{subscription.plan_name}</h2>
            <span>s/d {formatDate(subscription.end_date)}</span>
          </div>
          <div className={styles.subscriptionCardFooter}>
            {showRenewButton && (
              <Link href="/pricing" className={styles.renewButton}>
                Perpanjang
              </Link>
            )}
            {hasPendingRenewal && (
              <span className={styles.pendingBadge}>Menunggu Verifikasi</span>
            )}
          </div>
        </div>
      </section>
    );
  }
);
SubscriptionCard.displayName = "SubscriptionCard";

// Profile Section
const ProfileSection = memo(({ loading, user }: { loading: boolean; user: any }) => (
  <section className={styles.tierSection}>
    {loading ? (
      <LoadingSkeleton />
    ) : user ? (
      <>
        {user.tier_icon ? (
          <img
            src={`${user.tier_icon}`}
            alt={user.tier_list_name || "Tier Icon"}
            className={styles.tierIcon}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/dummy.png";
            }}
          />
        ) : (
          <div className={styles.tierIconPlaceholder} />
        )}
        <div className={styles.userTier}>
          <h1>{`${user.first_name} ${user.last_name}`}</h1>
          <span>{user.tier_list_name}</span>
        </div>
      </>
    ) : (
      <div className={styles.errorContainer}>
        <GiCancel size={80} className={styles.errorIcon} />
        <div className={styles.userTier}>
          <h1>Pengguna tidak ditemukan</h1>
          <span>Silakan login kembali</span>
        </div>
      </div>
    )}
  </section>
));
ProfileSection.displayName = "ProfileSection";

// Stats Card
const StatsCard = memo(
  ({ title, value, unit, footer, icon, className, iconClassName }: {
    title: string; value: string | number; unit: string | React.ReactElement; footer: string | React.ReactElement; icon: React.ReactElement; className: string; iconClassName?: string;
  }) => (
    <div className={`${styles.baseCard} ${className}`}>
      <div className={styles.cardHeader}>
        <div className={`${styles.cardSymbol} ${iconClassName || ''}`}>{icon}</div>
        <p>{title}</p>
      </div>
      <div className={styles.cardValue}>
        <h1>{value}</h1>
        <span>{unit}</span>
      </div>
      <div className={styles.cardFooter}>{footer}</div>
    </div>
  )
);
StatsCard.displayName = "StatsCard";

// Target Card (With Fix for .toFixed Error)
const TargetCard = memo(
  ({ totalMonthly, wasteTarget }: { totalMonthly: number | string; wasteTarget: number | string; }) => {
    // Safety check: convert to number, default to 0
    const safeTotal = Number(totalMonthly) || 0;
    const safeTarget = Number(wasteTarget) || 0;

    const percentage = useMemo(
      () => (safeTarget > 0 ? Math.min((safeTotal / safeTarget) * 100, 100) : 0),
      [safeTotal, safeTarget]
    );

    return (
      <div className={`${styles.baseCard} ${styles.leftTargetCard}`}>
        <div className={styles.leftTargetHeader}>
          <div className={styles.leftTargetSymbol}><TbTargetArrow /></div>
          <p>Target sampah terkumpul</p>
        </div>
        <div className={styles.leftTargetProgressContainer}>
          <div className={styles.leftTargetProgressPercentage}>
            <p>{percentage.toFixed(1)} %</p>
          </div>
          <div className={styles.leftTargetProgressBarContainer}>
            <div className={styles.leftTargetProgressBarOverlay} style={{ width: `${percentage}%` }}>
              <p>{safeTotal.toFixed(2)} Kg</p>
            </div>
          </div>
        </div>
        <div className={styles.progressTarget}>
          <p>{safeTarget.toFixed(2)} Kg</p>
        </div>
        <div className={styles.progressFooter}>
          <p>*Target kontribusi sampah setiap minggu</p>
        </div>
      </div>
    );
  }
);
TargetCard.displayName = "TargetCard";

// Pie Chart Card (Uses separate component)
const PieChartCard = memo(({ data, loading }: { data: PieDataEntry[]; loading: boolean }) => (
  <div className={`${styles.baseCard} ${styles.pieChartCard}`}>
    <div className={styles.pieChartHeader}>
      <div className={styles.pieChartSymbol}><FaTrash /></div>
      <p>Kategori sampah yang terkumpul</p>
    </div>

    {/* Gunakan Komponen Terpisah yang menerima Colors sebagai Props */}
    <WastePieChart data={data} loading={loading} colors={CHART_COLORS} />

    {/* Legend Footer */}
    {!loading && data.length > 0 && (
      <div className={styles.pieChartFooter}>
        {data.map((entry, index) => (
          <div className={styles.pieChartDataInfo} key={`legend-${index}`}>
            <div
              className={styles.pieChartColorInfo}
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    )}
  </div>
));
PieChartCard.displayName = "PieChartCard";

// Line Chart Card
const LineChartCard = memo(
  ({ data, totalWaste, averageWaste, loading }: { data: LineDataEntry[]; totalWaste: string; averageWaste: string; loading: boolean }) => (
    <div className={`${styles.baseCard} ${styles.lineChartCard}`}>
      <div className={styles.infoContainer}>
        <div className={styles.lineChartHeader}>
          <div className={styles.lineChartSymbol}><FaCoins /></div>
          <p>Detail sampah yang terkumpul</p>
        </div>
        <div className={styles.lineChartBodyContainer}>
          <div className={styles.lineChartDataCard}>
            <p>Total Sampah</p>
            <h2>{totalWaste} Kg</h2>
          </div>
          <div className={styles.lineChartDataCard}>
            <p>Average Sampah</p>
            <h2>{averageWaste} Kg</h2>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer className={styles.lineChart} width="100%" height="100%" minWidth={200} minHeight={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#2E4F3E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E4F3E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} unit="kg" />
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
            <Tooltip formatter={(value: any) => [`${value} kg`, "Total"]} />
            <Area type="monotone" dataKey="value" stroke="#2E4F3E" strokeWidth={2} fillOpacity={1} fill="url(#colorGreen)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className={styles.emptyChart}>
          <p>{loading ? "Memuat data..." : "Data tidak tersedia untuk rentang waktu yang dipilih."}</p>
        </div>
      )}
    </div>
  )
);
LineChartCard.displayName = "LineChartCard";

// --- MAIN PAGE ---

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  // Initialize date range with last 30 days
  const getDefaultDateRange = (): [Date, Date] => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return [start, end];
  };

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(getDefaultDateRange);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [hasPendingRenewal, setHasPendingRenewal] = useState<boolean>(false);

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  // Fetch subscription info
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/dashboard/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: session.user.id }),
        });

        const result = await response.json();

        if (result.status === "subscribed" && result.subscription) {
          setSubscriptionInfo(result.subscription);
          setHasPendingRenewal(result.has_pending_renewal || false);
        } else if (result.status === "not_subscribed") {
          // Not subscribed users cannot access dashboard at all
          router.push("/pricing");
          return;
        }
        // pending_payment users can access dashboard (except pickup page)
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [session?.user?.id, router]);

  const fetchDashboardData = useCallback(async (userId: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/getUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, start_date: start, end_date: end }),
      });
      const data = await res.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error("Fetch dashboard failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const [start, end] = dateRange;
    if (start || end) {
      fetchDashboardData(userId, start?.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }), end?.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
    } else if (!hasFetchedRef.current) {
      fetchDashboardData(userId);
      hasFetchedRef.current = true;
    }
  }, [session?.user?.id, dateRange, fetchDashboardData]);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange([e.target.value ? new Date(e.target.value) : null, dateRange[1]]);
  }, [dateRange]);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange([dateRange[0], e.target.value ? new Date(e.target.value) : null]);
  }, [dateRange]);

  const handleReset = useCallback(() => {
    const [defaultStart, defaultEnd] = getDefaultDateRange();
    setDateRange([defaultStart, defaultEnd]);
  }, []);

  const formatShortDate = useCallback((isoString: string): string => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }, []);

  const processedPieData = useMemo((): PieDataEntry[] => {
    if (!dashboardData?.categories) return [];
    return dashboardData.categories.map((entry) => ({
      name: entry.category,
      value: parseFloat(entry.total),
    }));
  }, [dashboardData?.categories]);

  const processedLineData = useMemo((): LineDataEntry[] => {
    if (!dashboardData?.daily) return [];
    return dashboardData.daily.map((entry) => ({
      date: formatShortDate(entry.date),
      value: parseFloat(entry.total),
    }));
  }, [dashboardData?.daily, formatShortDate]);

  const lineChartStats = useMemo(() => {
    const daily = dashboardData?.daily;
    const total = dashboardData?.total_waste;
    if (!daily || !daily.length || !total) return { total: "0.00", average: "0.00" };
    const totalNum = parseFloat(total);
    return {
      total: totalNum.toFixed(2),
      average: (totalNum / daily.length).toFixed(2),
    };
  }, [dashboardData]);

  return (
    <>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.topRow}>
        <FilterSection
          dateRange={dateRange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onReset={handleReset}
        />
        <ProfileSection loading={loading} user={session?.user} />
        <SubscriptionCard subscription={subscriptionInfo} loading={subscriptionLoading} hasPendingRenewal={hasPendingRenewal} />
      </div>
      <div className={styles.secondRow}>
        <StatsCard
          title="Total sampah yang dibuang"
          value={dashboardData?.total_waste || "0"}
          unit="Kg"
          footer={<h1>*Total sampah kamu secara keseluruhan</h1>}
          icon={<PiSigma />}
          className={styles.totalSampahCard}
        />
        <StatsCard
          title="Jumlah poin yang dikumpulkan"
          value={(dashboardData?.points_current || 0).toLocaleString()}
          unit="Points"
          footer={<><span>+{(dashboardData?.points_last_earned || 0).toLocaleString()} Poin</span><h1>dari poin sebelumnya</h1></>}
          icon={<FaStar />}
          className={styles.totalPointCard}
        />
        <StatsCard
          title="Streak Mingguan"
          value={dashboardData?.current_streak || 0}
          unit={<FaFire size={28} color={dashboardData?.streak_active_this_week ? '#FF4D4D' : '#B0B0B0'} />}
          footer={<h1>{dashboardData?.streak_active_this_week ? '*Streak aktif minggu ini!' : '*Belum ada pickup minggu ini'}</h1>}
          icon={<FaFire />}
          className={styles.totalStreakCard}
        />
      </div>
      <div className={styles.lastRow}>
        <div className={styles.leftCol}>
          <TargetCard totalMonthly={dashboardData?.total_monthly || 0} wasteTarget={dashboardData?.waste_target || 0} />
          <PieChartCard data={processedPieData} loading={loading} />
        </div>
        <LineChartCard
          data={processedLineData}
          totalWaste={lineChartStats.total}
          averageWaste={lineChartStats.average}
          loading={loading}
        />
      </div>
    </>
  );
}