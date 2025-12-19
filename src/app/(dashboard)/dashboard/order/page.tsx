"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { showToast } from "@/lib/toastHelper";
import {
  FaFileAlt,
  FaCheck,
  FaTruck,
  FaFlagCheckered,
  FaCopy,
} from "react-icons/fa";
import { LuPackageCheck } from "react-icons/lu";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import styles from "./order.module.css";

const OrderHistoryTable = dynamic(
  () => import("@/app/components/Large/OrderHistoryTable/OrderHistoryTable"),
  {
    ssr: false,
    loading: () => (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading riwayat transaksi...
      </div>
    ),
  }
);

interface ActiveOrder {
  event_id: number;
  pickup_id: number | null;
  transaction_code: string;
  pickup_address: string;
  pickup_weight: number;
  pickup_regency: string;
  event_date: string;
  pickup_time: string;
  pickup_type: string;
  vehicle_category: string;
  current_step: number;
  is_completed: boolean;
  has_driver: boolean;
  driver: {
    id: number;
    name: string;
    phone: string;
    image: string | null;
  } | null;
  vehicle: {
    id: number;
    name: string;
    license_plate: string;
    category: string;
    image: string | null;
  } | null;
}

interface ReceiptItem {
  id: number;
  category_name: string;
  icon: string | null;
  weight: number;
  points_per_kg: number;
  points_earned: number;
}

interface Receipt {
  pickup_id: number;
  transaction_code: string;
  completion_time: string;
  address: string;
  items: ReceiptItem[];
  total_weight: number;
  total_points: number;
  user_current_points: number;
  current_tier_name: string | null;
}

const STEPS = [
  { id: 1, label: "Pesenan dibuat", icon: FaFileAlt },
  { id: 2, label: "Pesenan dikonfirmasi", icon: FaCheck },
  { id: 3, label: "Menunggu Waktu Penjemputan", icon: MdAccessTimeFilled },
  { id: 4, label: "Armada Menuju lokasi Pick Up", icon: FaTruck },
  { id: 5, label: "Armada Pick Up", icon: LuPackageCheck },
  { id: 6, label: "Pesenan Selesai", icon: FaFlagCheckered },
];

export default function HistoryPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<"onProgress" | "done">(
    "onProgress"
  );
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Load persisted receipt from localStorage on mount
  useEffect(() => {
    const savedReceipt = localStorage.getItem("silap_pending_receipt");
    if (savedReceipt) {
      try {
        const parsedReceipt = JSON.parse(savedReceipt);
        setReceipt(parsedReceipt);
        setShowReceipt(true);
      } catch (e) {
        localStorage.removeItem("silap_pending_receipt");
      }
    }
  }, []);

  // Check if the completed order has already been acknowledged
  const isOrderAcknowledged = (pickupId: number | null): boolean => {
    if (!pickupId) return false;
    const acknowledged = localStorage.getItem("silap_acknowledged_pickups");
    if (!acknowledged) return false;
    try {
      const ids = JSON.parse(acknowledged) as number[];
      return ids.includes(pickupId);
    } catch {
      return false;
    }
  };

  const fetchActiveOrder = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/pickup/active-order");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        const orderData = data.data;

        // If order is completed and already acknowledged, treat as no active order
        if (orderData?.is_completed && orderData?.pickup_id && isOrderAcknowledged(orderData.pickup_id)) {
          setActiveOrder(null);
        } else {
          setActiveOrder(orderData);
        }
        setError(null);
      } else {
        setError(data.detail || "Gagal memuat data");
      }
    } catch (err) {
      console.error("Error fetching active order:", err);
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (activeTab === "onProgress") {
      fetchActiveOrder();
    }
  }, [activeTab, fetchActiveOrder]);

  // Silent polling every 15 seconds
  useEffect(() => {
    if (activeTab !== "onProgress") return;
    if (activeOrder?.is_completed) return; // Stop polling if completed

    const interval = setInterval(() => {
      fetchActiveOrder();
    }, 15000);

    return () => clearInterval(interval);
  }, [activeTab, activeOrder?.is_completed, fetchActiveOrder]);

  const handleCopyResi = () => {
    if (activeOrder?.transaction_code) {
      navigator.clipboard.writeText(activeOrder.transaction_code);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const fetchReceipt = async (pickupId: number) => {
    try {
      setReceiptLoading(true);
      const oldTierName = session?.user?.tier_list_name;

      const res = await fetch(`/api/dashboard/pickup/receipt?pickup_id=${pickupId}`);
      const data = await res.json();
      if (data.message === "SUCCESS") {
        setReceipt(data.data);
        setShowReceipt(true);
        // Save to localStorage so it persists across page navigations
        localStorage.setItem("silap_pending_receipt", JSON.stringify(data.data));

        // Check if tier was upgraded
        const newTierName = data.data.current_tier_name;
        if (oldTierName && newTierName && oldTierName !== newTierName) {
          setTimeout(() => {
            showToast("success", `🎉 Selamat! Tier kamu naik ke ${newTierName}!`);
          }, 500);
        }

        // Update session with new points and tier
        if (session && data.data.user_current_points !== undefined) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              points: data.data.user_current_points,
              tier_list_name: newTierName,
            },
          });
        }
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
    } finally {
      setReceiptLoading(false);
    }
  };

  // Function to close receipt and clear from localStorage
  const handleCloseReceipt = () => {
    // Mark this pickup as acknowledged so it won't show again
    if (receipt?.pickup_id) {
      const acknowledged = localStorage.getItem("silap_acknowledged_pickups");
      let ids: number[] = [];
      if (acknowledged) {
        try {
          ids = JSON.parse(acknowledged);
        } catch {
          ids = [];
        }
      }
      if (!ids.includes(receipt.pickup_id)) {
        ids.push(receipt.pickup_id);
        // Keep only last 10 IDs to prevent localStorage bloat
        if (ids.length > 10) ids = ids.slice(-10);
        localStorage.setItem("silap_acknowledged_pickups", JSON.stringify(ids));
      }
    }
    // Set activeOrder to null FIRST to prevent useEffect from re-triggering
    setActiveOrder(null);
    setShowReceipt(false);
    setReceipt(null);
    localStorage.removeItem("silap_pending_receipt");
    // Refresh to get any remaining orders
    fetchActiveOrder();
  };

  // Auto-show receipt when order is completed (and not already acknowledged)
  useEffect(() => {
    if (activeOrder?.is_completed && activeOrder?.pickup_id && !receipt && !isOrderAcknowledged(activeOrder.pickup_id)) {
      fetchReceipt(activeOrder.pickup_id);
    }
  }, [activeOrder?.is_completed, activeOrder?.pickup_id, receipt]);

  return (
    <div className={styles.orderContainer}>
      <h1 style={{ marginBottom: "3rem" }}>Pesanan Saya</h1>

      <div className={styles.activeTabContainer}>
        <button
          className={`${styles.tabs} ${activeTab === "onProgress" ? styles.active : ""
            }`}
          onClick={() => setActiveTab("onProgress")}
        >
          Sedang Diproses
        </button>

        <button
          className={`${styles.tabs} ${activeTab === "done" ? styles.active : ""
            }`}
          onClick={() => setActiveTab("done")}
        >
          Selesai
        </button>
      </div>

      {activeTab == "onProgress" && (
        <>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Memuat data pesanan...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={fetchActiveOrder}>Coba Lagi</button>
            </div>
          ) : !activeOrder ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>📦</div>
              <h2>Tidak Ada Pesanan Aktif</h2>
              <p>Anda tidak memiliki pesanan pickup yang sedang diproses hari ini.</p>
              <a href="/dashboard/pickup" className={styles.createOrderButton}>
                Buat Pesanan Baru
              </a>
            </div>
          ) : (
            <div className={styles.onProgressContainer}>
              {/* Main Card - Full Width */}
              <div className={styles.cardContainer}>
                <h1 className={styles.title}>Pesanan Sedang Diproses</h1>

                <div className={styles.stepperContainer}>
                  <div className={styles.stepperLine}></div>

                  {STEPS.map((step) => {
                    const isActive = step.id === activeOrder.current_step;
                    const isCompleted = step.id < activeOrder.current_step;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.id}
                        className={`${styles.stepItem} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""
                          }`}
                      >
                        <div
                          className={
                            isActive
                              ? styles.iconWrapperActive
                              : isCompleted
                                ? styles.iconWrapperCompleted
                                : styles.iconWrapper
                          }
                        >
                          <Icon
                            size={20}
                            color={isActive || isCompleted ? "#fff" : "#555"}
                          />
                        </div>
                        <div className={styles.stepText}>
                          <span className={styles.stepLabel}>{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.column}>
                    {/* Lokasi Armada */}
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionHeader}>
                        <span
                          className={`${styles.dot} ${styles.limeDot}`}
                        ></span>
                        Lokasi Armada
                      </h3>
                      <div className={styles.row}>
                        <span className={styles.label}>Wilayah</span>
                        <span className={styles.value}>
                          {activeOrder.pickup_regency || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Info Pick Up */}
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionHeader}>
                        <span className={`${styles.dot} ${styles.redDot}`}></span>
                        Info Pick Up
                      </h3>

                      <div
                        className={styles.row}
                        style={{ alignItems: "center" }}
                      >
                        <span className={styles.label}>No Resi</span>
                        <span className={styles.valueResi}>
                          <FaCopy
                            size={16}
                            className={styles.copyIcon}
                            onClick={handleCopyResi}
                            title="Salin nomor resi"
                          />{" "}
                          {activeOrder.transaction_code}
                        </span>
                      </div>

                      <div className={styles.addressBlock}>
                        <span className={styles.label}>Alamat</span>
                        <div className={styles.addressContent}>
                          <div className={styles.addressText}>
                            {activeOrder.pickup_address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.column}>
                    {/* Waktu Pick Up */}
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionHeader}>
                        <span
                          className={`${styles.dot} ${styles.cyanDot}`}
                        ></span>
                        Waktu Pick Up
                      </h3>
                      <div className={styles.row}>
                        <span className={styles.label}>Tanggal</span>
                        <span className={styles.value}>
                          {formatDate(activeOrder.event_date)}
                        </span>
                      </div>
                      <div className={styles.row}>
                        <span className={styles.label}>Jam</span>
                        <span className={styles.value}>
                          {formatTime(activeOrder.pickup_time)}
                        </span>
                      </div>
                    </div>

                    {/* Berat Sampah */}
                    <div className={styles.detailSection}>
                      <h3 className={styles.sectionHeader}>
                        <span
                          className={`${styles.dot} ${styles.orangeDot}`}
                        ></span>
                        Detail Pickup
                      </h3>
                      <div className={styles.row}>
                        <span className={styles.label}>Berat</span>
                        <span className={styles.value}>
                          ~{activeOrder.pickup_weight} Kg
                        </span>
                      </div>
                      <div className={styles.row}>
                        <span className={styles.label}>Tipe</span>
                        <span className={styles.value}>
                          {activeOrder.pickup_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed message */}
                {activeOrder.is_completed && (
                  <div className={styles.completedMessage}>
                    <FaFlagCheckered size={24} color="#2F5E44" />
                    <p>Pesanan Anda telah selesai! Terima kasih telah menggunakan SILAP.</p>
                    {activeOrder.pickup_id && (
                      <button
                        className={styles.viewReceiptButton}
                        onClick={() => fetchReceipt(activeOrder.pickup_id!)}
                        disabled={receiptLoading}
                      >
                        {receiptLoading ? "Memuat..." : "Lihat Rincian Poin"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Driver & Vehicle Info Row - Only show if driver is assigned */}
              {activeOrder.has_driver && (
                <div className={styles.infoCardsRow}>
                  {/* Driver Info Card */}
                  <div className={styles.driverInfoContainer}>
                    <h1>Informasi Driver</h1>

                    <div className={styles.driverDetailContainer}>
                      <div className={styles.driverImage}>
                        {activeOrder.driver?.image ? (
                          <Image
                            src={activeOrder.driver.image}
                            alt="Driver"
                            width={100}
                            height={100}
                            loading="lazy"
                          />
                        ) : (
                          <Image
                            src="/images/dummy-profiles.png"
                            alt="Driver"
                            width={100}
                            height={100}
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className={styles.driverDetail}>
                        <span>{activeOrder.driver?.name || "Driver SILAP"}</span>
                        <span style={{ color: "#666" }}>
                          {activeOrder.driver?.phone || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info Card */}
                  <div className={styles.vehicleInfoContainer}>
                    <h1>Armada SILAP</h1>

                    <div className={styles.vehicleDetailContainer}>
                      <div className={styles.vehicleImage}>
                        <Image
                          src={activeOrder.vehicle?.image || "/images/dummy-truck.png"}
                          alt="Vehicle"
                          width={200}
                          height={150}
                          loading="lazy"
                        />
                      </div>

                      <div className={styles.vehicleDetail}>
                        <span>{activeOrder.vehicle?.name || "Kendaraan SILAP"}</span>
                        <span style={{ color: "#2F5E44" }}>
                          {activeOrder.vehicle?.license_plate || "-"}
                        </span>
                        <span>{activeOrder.vehicle?.category || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab == "done" && <OrderHistoryTable />}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className={styles.modalOverlay} onClick={handleCloseReceipt}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🎉 Pickup Selesai!</h2>
              <button className={styles.closeButton} onClick={handleCloseReceipt}>×</button>
            </div>

            <div className={styles.receiptInfo}>
              <p className={styles.transactionCode}>{receipt.transaction_code}</p>
            </div>

            <div className={styles.receiptItems}>
              <h3>Rincian Poin</h3>
              {receipt.items.length > 0 ? (
                <table className={styles.receiptTable}>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Berat</th>
                      <th>Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.category_name}</td>
                        <td>{item.weight} Kg</td>
                        <td className={styles.pointsCell}>+{item.points_earned}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td><strong>Total</strong></td>
                      <td><strong>{receipt.total_weight} Kg</strong></td>
                      <td className={styles.pointsCell}><strong>+{receipt.total_points} Pts</strong></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className={styles.noItemsMessage}>
                  Sampah tidak dipilah. Poin akan dihitung berdasarkan berat total.
                </p>
              )}
            </div>

            <button className={styles.closeReceiptButton} onClick={handleCloseReceipt}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

