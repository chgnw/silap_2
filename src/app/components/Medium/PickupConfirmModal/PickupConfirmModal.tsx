"use client";

import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import styles from "./pickupConfirmModal.module.css";

interface PickupConfirmData {
  name: string;
  phone: string;
  address: string;
  regency: string;
  weight: string;
  date: string;
  time: string;
  vehicleType: string;
  pickupType: string;
  notes?: string;
  imagePreview?: string;
}

interface PickupConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: PickupConfirmData;
  isSubmitting?: boolean;
}

export default function PickupConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  isSubmitting = false,
}: PickupConfirmModalProps) {
  if (!isOpen) return null;

  // Format date to Indonesian format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  // Format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-";
    return timeStr.substring(0, 5);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/assets/silap-logo.svg"
              alt="SILAP"
              width={80}
              height={32}
              className={styles.logo}
            />
            <span className={styles.brandText}>SILAP</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        {/* Title */}
        <div className={styles.title}>
          <h2>Request Pickup</h2>
          <p>Konfirmasi detail penjemputan</p>
        </div>

        {/* Photo Preview */}
        {data.imagePreview && (
          <div className={styles.imageContainer}>
            <img
              src={data.imagePreview}
              alt="Foto Sampah"
              className={styles.previewImage}
            />
          </div>
        )}

        {/* Receipt Content */}
        <div className={styles.receiptContent}>
          <div className={styles.dividerDashed}></div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Nama</span>
            <span className={styles.receiptValue}>{data.name || "-"}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>No. Telp</span>
            <span className={styles.receiptValue}>{data.phone || "-"}</span>
          </div>

          <div className={styles.receiptRowFull}>
            <span className={styles.receiptLabel}>Alamat</span>
            <span className={styles.receiptValueFull}>
              {data.address || "-"}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Wilayah</span>
            <span className={styles.receiptValue}>{data.regency || "-"}</span>
          </div>

          <div className={styles.dividerDashed}></div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Estimasi Berat</span>
            <span className={styles.receiptValue}>
              {data.weight ? `${data.weight} Kg` : "-"}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Tanggal</span>
            <span className={styles.receiptValue}>{formatDate(data.date)}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Jam</span>
            <span className={styles.receiptValue}>{formatTime(data.time)}</span>
          </div>

          <div className={styles.dividerDashed}></div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Tipe Kendaraan</span>
            <span className={styles.receiptValue}>
              {data.vehicleType || "-"}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Tipe Pick Up</span>
            <span className={styles.receiptValue}>
              {data.pickupType || "-"}
            </span>
          </div>

          {data.notes && (
            <>
              <div className={styles.dividerDashed}></div>
              <div className={styles.receiptRowFull}>
                <span className={styles.receiptLabel}>Catatan</span>
                <span className={styles.receiptValueFull}>{data.notes}</span>
              </div>
            </>
          )}

          <div className={styles.dividerDashed}></div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Pastikan semua informasi sudah benar sebelum melanjutkan.
          </p>

          <div className={styles.buttonGroup}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              className={styles.confirmButton}
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi Pickup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
