"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./orders.module.css";
import { showToast } from "@/lib/toastHelper";
import { FaShoppingBag, FaSync, FaCog } from "react-icons/fa";
import { IoIosDocument } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";

interface PickupEvent {
  id: number;
  transaction_code: string;
  user_id: number;
  pickup_address: string;
  pickup_weight: number;
  pickup_type_id: number;
  event_date: string;
  pickup_time: string;
  vehicle_category_id: number | null;
  user_notes: string | null;
  image_url: string | null;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
  pickup_type_name: string;
  category_name: string;
  category_min_weight: number;
  category_max_weight: number;
}

interface TodayStats {
  total_orders: number;
  completed: number;
}

interface SetupRequired {
  vehicle: boolean;
  operational_area: boolean;
}

export default function DriverOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pickupEvents, setPickupEvents] = useState<PickupEvent[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    total_orders: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [setupRequired, setSetupRequired] = useState<SetupRequired | null>(
    null
  );
  const [isDriverActive, setIsDriverActive] = useState(false);

  // Fetch driver active status
  const fetchDriverStatus = async () => {
    try {
      const res = await fetch("/api/driver/info");
      const data = await res.json();
      if (data.message === "SUCCESS") {
        setIsDriverActive(data.data.is_active === 1);
      }
    } catch (error) {
      console.error("Error fetching driver status:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverStatus();
      fetchPickupEvents();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Auto-refresh every 15 seconds - only if driver is active
  useEffect(() => {
    if (status !== "authenticated" || !isDriverActive) return;

    const interval = setInterval(() => {
      fetchPickupEvents(true); // Silent refresh
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [status, isDriverActive]);

  const fetchPickupEvents = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const res = await fetch("/api/driver/pickup-events");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setPickupEvents(data.data.pickup_events || []);
        setTodayStats(data.data.today_stats);
        setSetupRequired(data.data.setup_required || null);
      } else {
        if (!silent) {
          showToast("error", "Gagal memuat data pickup");
        }
      }
    } catch (error) {
      console.error("Error fetching pickup events:", error);
      if (!silent) {
        showToast("error", "Terjadi kesalahan");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchDriverStatus(); // Update driver active status
    fetchPickupEvents(false);
    showToast("success", "Data berhasil diperbarui");
  };

  const handleCardClick = (eventId: number) => {
    router.push(`/driver/orders/${eventId}`);
  };

  if (loading || status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Order Pick Up</h1>
        <div className={styles.headerButtons}>
          <button
            className={styles.settingsButton}
            onClick={() => router.push("/driver/settings")}
            title="Pengaturan"
          >
            <FaCog />
          </button>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <FaSync className={refreshing ? styles.spinning : ""} />
        </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "#363636" }}
            >
              <IoIosDocument size={16} color="#FFD900" />
            </div>
            <p className={styles.statLabel}>Total Order</p>
          </div>

          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {todayStats.total_orders || 0}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "#363636" }}
            >
              <FaCircleCheck size={16} color="#00D727" />
            </div>
            <p className={styles.statLabel}>Selesai</p>
          </div>

          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {todayStats.completed || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Pickup Events List */}
      <div className={styles.eventsContainer}>
        {setupRequired ? (
          <div className={styles.emptyState}>
            <Image
              src="/images/karung.png"
              alt="Setup required"
              width={120}
              height={120}
            />
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              Pengaturan Diperlukan
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              {setupRequired.vehicle && setupRequired.operational_area
                ? "Kendaraan dan area operasional belum diatur. Silakan atur kendaraan dan area operasional Anda."
                : setupRequired.vehicle
                ? "Kendaraan belum diassign. Silahkan pilih kendaraan Anda pada menu awal."
                : "Area operasional belum diatur. Silakan atur area operasional Anda."}
            </p>
            {setupRequired.operational_area && (
              <button
                onClick={() => router.push("/driver/settings")}
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#2f5e44",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Atur Area Operasional
              </button>
            )}
          </div>
        ) : pickupEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <Image
              src="/images/karung.png"
              alt="No orders"
              width={120}
              height={120}
            />
            <p>Belum ada order untuk hari ini</p>
          </div>
        ) : (
          pickupEvents.map((event) => (
            <div
              key={event.id}
              className={styles.eventCard}
              onClick={() => handleCardClick(event.id)}
            >
              {/* Event Image */}
              <div className={styles.eventImage}>
                {event.image_url ? (
                  <Image
                    src={`/upload/${event.image_url}`}
                    alt="Pickup location"
                    width={120}
                    height={120}
                    className={styles.pickupImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <FaShoppingBag size={40} color="#ccc" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className={styles.eventInfo}>
                <div className={styles.eventRow}>
                  <span className={styles.eventLabel}>Nama</span>
                  <span className={styles.eventValue}>
                    {event.first_name} {event.last_name || ""}
                  </span>
                </div>

                <div className={styles.eventRow}>
                  <span className={styles.eventLabel}>Order ID</span>
                  <span className={styles.eventValue}>
                    {event.transaction_code}
                  </span>
                </div>

                <div className={styles.eventRow}>
                  <span className={styles.eventLabel}>Jam</span>
                  <span className={styles.eventValue}>
                    {event.pickup_time.substring(0, 5)}
                  </span>
                </div>

                <div className={styles.eventRow}>
                  <span className={styles.eventLabel}>Berat</span>
                  <span className={styles.eventValue}>
                    {event.pickup_weight} Kg
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
