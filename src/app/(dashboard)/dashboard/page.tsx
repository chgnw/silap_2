"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation"

import { PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { FaFilter, FaStar, FaTrash, FaCoins } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
import { PiSigma } from "react-icons/pi";
import { TbTargetArrow } from "react-icons/tb";
import { GiDeerHead, GiBirdTwitter, GiElephant, GiCancel } from "react-icons/gi";
import styles from "../dashboard.module.css";

// Warna dummy untuk tiap category, kalau mau ganti silahkan
// (sepertinya bakal hard coded aja daripada disimpen di DB)
const CHART_COLORS = [
  "#2E4F3E", 
  "#75A68C", 
  "#C8E3D4", 
  "#F4A261", 
  "#E76F51", 
  "#2A9D8F", 
  "#E9C46A", 
];

type PieDataEntry = {
  name: string;
  value: number;
};

type LineDataEntry = {
  date: string;
  value: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push('/login')
  }, [session])

  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
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
      fetchDashboardData(session?.user?.id);
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

  const formatShortDate = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const processedPieData = useMemo((): PieDataEntry[] => {
    const categories = dashboardData?.categories;
    if (!categories || categories.length === 0) {
      return [];
    }

    return categories.map((entry: any): PieDataEntry => ({
      name: entry.category,
      value: parseFloat(entry.total),
    }));
  }, [dashboardData]);

  const processedLineData = useMemo((): LineDataEntry[] => {
    const daily = dashboardData?.daily;
    if (!daily || daily.length === 0) {
      return [];
    }

    return daily.map((entry: any): LineDataEntry => ({
      date: formatShortDate(entry.date),
      value: parseFloat(entry.total),
    }));
  }, [dashboardData]);
  
  const lineChartStats = useMemo(() => {
    const daily = dashboardData?.daily;
    const total = dashboardData?.total_waste;

    if (!daily || daily.length === 0 || !total) {
      return { total: '0.00', average: '0.00' };
    }
    
    const totalNum = parseFloat(total);
    const average = totalNum / daily.length;
    
    return {
      total: totalNum.toFixed(2),
      average: average.toFixed(2),
    };
  }, [dashboardData]);

  return (
    <>
      <h1 className={styles.title}>Dashboard</h1>

      {/* Top Row */}
      <div className={styles.topRow}>
        <section className={styles.filterSection}>
          <div className={styles.filterSectionHeader}>
            <FaFilter size={16}/>
            <span>Filter</span>
          </div>

          <div className={styles.filterGroup}>
            <div style={{width: '100%'}}>
              <label className={styles.filterLabel}>Tanggal Mulai:</label>
              <input
                type="date"
                max={today}
                className={styles.filterInput}
                value={dateRange[0] ? dateRange[0].toISOString().split("T")[0] : ""}
                onChange={handleStartDateChange}
              />
            </div>

            <div style={{width: '100%'}}>
              <label className={styles.filterLabel}>Tanggal Akhir:</label>
              <input
                type="date"
                max={today}
                className={styles.filterInput}
                value={dateRange[1] ? dateRange[1].toISOString().split("T")[0] : ""}
                onChange={handleEndDateChange}
              />
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

        <section className={styles.tierSection} style={{ width: '100%' }}>
          {loading ? (
            // Loading
            <div style={{ textAlign: 'center' }}>
              <div className="animate-pulse">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    margin: '0 auto',
                  }}
                />
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      width: 120,
                      height: 20,
                      backgroundColor: '#e0e0e0',
                      margin: '8px auto',
                      borderRadius: 6,
                    }}
                  />
                  <div
                    style={{
                      width: 80,
                      height: 16,
                      backgroundColor: '#e0e0e0',
                      margin: '4px auto',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : session?.user ? (
            // Success baca session user
            <>
              {session.user.tier_list_id === 1 ? (
                <GiDeerHead size={80} style={{ color: '#A4B465' }} />
              ) : session.user.tier_list_id === 2 ? (
                <GiBirdTwitter size={80} style={{ color: '#42D4F5' }} />
              ) : session.user.tier_list_id === 3 ? (
                <GiElephant size={80} style={{ color: '#ED1C24' }} />
              ) : (
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#ccc',
                  }}
                />
              )}

              <div className={styles.userTier}>
                <h1>{`${session.user.first_name} ${session.user.last_name}`}</h1>
                <span>{session.user.tier_list_name}</span>
              </div>
            </>
          ) : (
            // Failed baca session user
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.7, gap: '0.5rem' }}>
              <GiCancel size={80} color="#A4B465" />
              <div className={styles.userTier}>
                <h1>Pengguna tidak ditemukan</h1>
                <span>Silakan login kembali</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Second Row */}
      <div className={styles.secondRow} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Total Sampah Card */}
        <div className={`${styles.baseCard} ${styles.totalSampahCard}`}>
          <div className={styles.totalSampahHeader}>
            <div className={styles.totalSampahSymbol}>
              <PiSigma /> 
            </div>
            <p>Total sampah yang dibuang</p>  
          </div>

          <div className={styles.totalSampahValue}>
            <h1>{dashboardData?.total_waste}</h1>
            <span>Kg</span>
          </div>

          <div className={styles.totalSampahFooter}>
            <h1>*total sampah kamu keseluruhan</h1>
          </div>
        </div>

        {/* Total Point Card */}
        <div className={`${styles.baseCard} ${styles.totalPointCard}`}>
          <div className={styles.totalPointHeader}>
            <div className={styles.totalPointSymbol}>
              <FaStar style={{color: '#A4B465'}}/> 
            </div>
            <p>Jumlah point yang terkumpul</p>
          </div>

          <div className={styles.totalPointValue}>
            <h1>{dashboardData?.points_current}</h1>
            <span>Points</span>
          </div>

          <div className={styles.totalPointFooter}>
            <span>+{dashboardData?.points_last_earned}</span>
            <h1>dari point sebelumnya</h1>
          </div>
        </div>

          {/* Total Streak Card */}
        <div className={`${styles.baseCard} ${styles.totalStreakCard}`}>
          <div className={styles.totalStreakHeader}>
            <div className={styles.totalStreakSymbol}>
              <FaFire style={{color: '#2F5E44'}}/> 
            </div>
            <p>Streak Harian</p>
          </div>

          <div className={styles.totalStreakValue}>
            <h1>{dashboardData?.current_streak}</h1>
            <span>🔥</span>
          </div>

          <div className={styles.totalStreakFooter}>
            <h1>*Pertahankan streak dengan konsisten</h1>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.lastRow}>
        {/* LEFT SIDE */}
        <div className={styles.leftCol}>
          {/* Target Card */}
          <div className={`${styles.baseCard} ${styles.leftTargetCard}`}>
            <div className={styles.leftTargetHeader}>
              <div className={styles.leftTargetSymbol}>
                <TbTargetArrow style={{color: '#2F5E44'}}/> 
              </div>
              <p>Target Sampah Terkumpul</p>
            </div>


            <div className={styles.leftTargetProgressContainer}>
              <div className={styles.leftTargetProgressPercentage}>
                  <p>50%</p>
              </div>  
              <div className={styles.leftTargetProgressBarContainer}>
                <div className={styles.leftTargetProgressBarOverlay} style={{ width: "50%", height: '100%', backgroundColor: "#A4B465"}}>
                    15 Kg
                </div>
              </div>
            </div>

            <div style={{width: '100%'}}>
              <p style={{float: 'right'}}>(P) 30 Kg</p>
            </div>

            <div style={{width: '100%'}}>
              <p style={{color: '#000000', fontSize: '0.875rem', fontWeight: '500'}}>
                *Target kontribusi sampah setiap minggu
              </p>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className={`${styles.baseCard} ${styles.pieChartCard}`}>
            <div className={styles.pieChartHeader}>
              <div className={styles.pieChartSymbol}>
                <FaTrash style={{color: '#2F5E44'}}/> 
              </div>
              <p>Kategori Sampah yang Terkumpul</p>
            </div>

            {processedPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={processedPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="70%"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {processedPieData.map((_entry: PieDataEntry, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} kg`, name]} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Dynamic Legend Pie Chart */}
                <div className={styles.pieChartFooter}>
                  {processedPieData.map((entry: PieDataEntry, index: number) => (
                    <div className={styles.pieChartDataInfo} key={`legend-${index}`}>
                      <div 
                        className={styles.pieChartColorInfo} 
                        style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <p>{loading ? 'Memuat data...' : 'No data available for this period.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`${styles.baseCard} ${styles.lineChartCard}`}>
          <div className={styles.infoContainer}>
            <div className={styles.lineChartHeader}>
              <div className={styles.lineChartSymbol}>
                <FaCoins style={{color: '#2F5E44'}}/>
              </div>
              <p>Detail sampah yang terkumpul</p>
            </div>

            <div className={styles.lineChartBodyContainer}>
              <div className={styles.lineChartDataCard}>
                <p>Total Sampah</p>
                <h2>{lineChartStats.total ? lineChartStats.total : '0.00'} Kg</h2>
              </div>
              <div className={styles.lineChartDataCard}>
                <p>Average Sampah</p>
                <h2>{lineChartStats.average ? lineChartStats.average : '0.00'} Kg</h2>
              </div>
            </div>
          </div>

          {processedLineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="30%">
              <AreaChart data={processedLineData}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#2E4F3E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E4F3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="kg"
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <Tooltip formatter={(value: number) => [`${value} kg`, "Total"]} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2E4F3E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <p>{loading ? 'Memuat data...' : 'No data available for this period.'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}