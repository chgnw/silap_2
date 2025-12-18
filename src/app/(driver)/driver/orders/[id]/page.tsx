"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import styles from "./detail.module.css";
import { showToast } from "@/lib/toastHelper";
import { FaArrowLeft, FaMapMarkerAlt, FaTruck, FaCheck } from "react-icons/fa";

interface PickupEventDetail {
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
  email: string;
  phone_number: string | null;
  pickup_type_name: string;
  category_name: string;
  category_min_weight: number;
  category_max_weight: number;
  pickup_id: number | null;
  status: string | null;
  transaction_status_id?: number | null;
}

export default function PickupEventDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<PickupEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [onTheWayLoading, setOnTheWayLoading] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchEventDetail();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/driver/pickup-events/${eventId}`);
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setEvent(data.data);
      } else {
        showToast("error", "Gagal memuat detail pickup");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching event detail:", error);
      showToast("error", "Terjadi kesalahan");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      setAccepting(true);
      const res = await fetch(`/api/driver/pickup-events/${eventId}/accept`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", data.detail || "Order berhasil di-accept!");
        // Refresh to get updated status
        await fetchEventDetail();
      } else {
        showToast("error", data.detail || "Gagal accept order");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setAccepting(false);
    }
  };

  const handleOnTheWay = async () => {
    try {
      setOnTheWayLoading(true);
      const res = await fetch(`/api/driver/pickup-events/${eventId}/on-the-way`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Status berhasil diupdate. Menuju lokasi pickup!");
        // Refresh to get updated status
        await fetchEventDetail();
      } else {
        showToast("error", data.detail || "Gagal update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setOnTheWayLoading(false);
    }
  };

  const handleArrived = async () => {
    try {
      setArrivedLoading(true);
      const res = await fetch(`/api/driver/pickup-events/${eventId}/arrived`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Status berhasil diupdate. Mulai pickup!");
        // Redirect to upload page
        router.push(`/driver/orders/${eventId}/upload`);
      } else {
        showToast("error", data.detail || "Gagal update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setArrivedLoading(false);
    }
  };

  const handleUploadOrder = () => {
    router.push(`/driver/orders/${eventId}/upload`);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showToast("error", "Alasan pembatalan harus diisi");
      return;
    }

    try {
      setCancelling(true);
      const res = await fetch(`/api/driver/pickup-events/${eventId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Order berhasil dibatalkan");
        setShowCancelModal(false);
        // Redirect back to orders list
        router.push("/driver/orders");
      } else {
        showToast("error", data.detail || "Gagal membatalkan order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setCancelling(false);
    }
  };

  // Helper to determine current status
  const getStatusInfo = () => {
    if (!event) return { label: "-", step: 0 };

    if (!event.pickup_id) {
      return { label: "Belum di-accept", step: 0 };
    }

    // Based on transaction_status_id from the API
    // 2 = Accepted, 6 = Menuju Lokasi, 7 = Sampai di Lokasi, 4 = Completed
    switch (event.status) {
      case "Accepted":
        return { label: "Menunggu Waktu Penjemputan", step: 1 };
      case "Menuju Lokasi":
        return { label: "Menuju Lokasi Pickup", step: 2 };
      case "Sampai di Lokasi":
        return { label: "Sedang Pickup", step: 3 };
      case "Completed":
        return { label: "Selesai", step: 4 };
      default:
        return { label: event.status || "Unknown", step: 0 };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading || status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.container}>
        <p>Event tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FaArrowLeft />
        </button>
        <h1 className={styles.title}>Order Pick Up</h1>
      </div>

      {/* Status Badge */}
      {event.pickup_id && (
        <div className={styles.statusBadge}>
          <span className={`${styles.statusDot} ${styles[`step${statusInfo.step}`]}`}></span>
          <span>{statusInfo.label}</span>
        </div>
      )}

      {/* Detail Card */}
      <div className={styles.detailCard}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Nama</span>
          <span className={styles.detailValue}>
            {event.first_name} {event.last_name || ""}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>No Handphone</span>
          <span className={styles.detailValue}>
            {event.phone_number || "-"}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Order ID</span>
          <span className={styles.detailValue}>{event.transaction_code}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Jam</span>
          <span className={styles.detailValue}>
            {event.pickup_time.substring(0, 5)}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Berat</span>
          <span className={styles.detailValue}>{event.pickup_weight} Kg</span>
        </div>

        <div className={styles.detailRowFull}>
          <div className={styles.addressHeader}>
            <FaMapMarkerAlt />
            <span className={styles.detailLabel}>Alamat</span>
          </div>
          <p className={styles.addressValue}>{event.pickup_address}</p>
        </div>

        {event.user_notes && (
          <div className={styles.detailRowFull}>
            <span className={styles.detailLabel}>Catatan Tambahan</span>
            <p className={styles.notesValue}>{event.user_notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Dynamic based on status */}
      {!event.pickup_id ? (
        // Event belum di-accept, show Accept button
        <button
          className={styles.acceptButton}
          onClick={handleAcceptOrder}
          disabled={accepting}
        >
          {accepting ? "Memproses..." : "Accept Order"}
        </button>
      ) : event.status === "Accepted" ? (
        // Status: Accepted - Show "Menuju Lokasi" button
        <div className={styles.actionButtons}>
          <button
            className={styles.onTheWayButton}
            onClick={handleOnTheWay}
            disabled={onTheWayLoading}
          >
            <FaTruck />
            {onTheWayLoading ? "Memproses..." : "Menuju Lokasi"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setShowCancelModal(true)}
          >
            Batalkan Order
          </button>
        </div>
      ) : event.status === "Menuju Lokasi" ? (
        // Status: Menuju Lokasi - Show "Sudah Sampai" button
        <div className={styles.actionButtons}>
          <button
            className={styles.arrivedButton}
            onClick={handleArrived}
            disabled={arrivedLoading}
          >
            <FaCheck />
            {arrivedLoading ? "Memproses..." : "Sudah Sampai"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setShowCancelModal(true)}
          >
            Batalkan Order
          </button>
        </div>
      ) : event.status === "Sampai di Lokasi" ? (
        // Status: Sampai di Lokasi - Show Upload button
        <div className={styles.actionButtons}>
          <button className={styles.uploadButton} onClick={handleUploadOrder}>
            Upload Order
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setShowCancelModal(true)}
          >
            Batalkan Order
          </button>
        </div>
      ) : event.status !== "Completed" ? (
        // Fallback for other non-completed statuses
        <div className={styles.actionButtons}>
          <button className={styles.uploadButton} onClick={handleUploadOrder}>
            Upload Order
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setShowCancelModal(true)}
          >
            Batalkan Order
          </button>
        </div>
      ) : (
        // Event sudah complete
        <div className={styles.completedMessage}>
          <p>Order ini sudah selesai</p>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Batalkan Order</h2>
            <p className={styles.modalDescription}>
              Mohon berikan alasan pembatalan order ini
            </p>

            <div className={styles.modalForm}>
              <label className={styles.modalLabel}>Alasan Pembatalan *</label>
              <select
                className={styles.modalSelect}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Pilih alasan...</option>
                <option value="Customer tidak bisa dihubungi">
                  Customer tidak bisa dihubungi
                </option>
                <option value="Sampah tidak ditemukan">
                  Sampah tidak ditemukan
                </option>
                <option value="Alamat tidak ditemukan">
                  Alamat tidak ditemukan
                </option>
                <option value="Customer membatalkan">
                  Customer membatalkan
                </option>
                <option value="Kendala kendaraan">Kendala kendaraan</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              {cancelReason === "Lainnya" && (
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Jelaskan alasan pembatalan..."
                  rows={3}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              )}
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={cancelling}
              >
                Batal
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? "Memproses..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
