"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave, FaMapMarkerAlt, FaTruck } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";

import { showToast } from "@/lib/toastHelper";
import RegencySelector from "@/app/components/Medium/RegencySelector/RegencySelector";
import styles from "./settings.module.css";

interface DriverSettings {
  driver_id: number;
  operational_area: string | null;
  assigned_vehicle_id: number | null;
  is_available: boolean;
  is_verified: number;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_license_plate: string | null;
  vehicle_category: string | null;
  vehicle_category_id: number | null;
}

export default function DriverSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DriverSettings | null>(null);
  const [operationalArea, setOperationalArea] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/driver/settings");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setSettings(data.data);
        setOperationalArea(data.data.operational_area || "");
      } else {
        showToast("error", "Gagal memuat pengaturan");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!operationalArea) {
      showToast("error", "Silakan pilih area operasional");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/driver/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operational_area: operationalArea,
        }),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Pengaturan berhasil disimpan!");
        // Refresh settings
        await fetchSettings();
      } else {
        showToast("error", data.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
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
        <button className={styles.backButton} onClick={() => router.back()}>
          <FaArrowLeft color="var(--color-primary-dark)" />
        </button>
        <h1 className={styles.title}>Pengaturan Driver</h1>
      </div>

      {/* Settings Content */}
      <div className={styles.content}>
        {/* Verification Warning */}
        {settings && settings.is_verified !== 1 && (
          <div className={styles.verificationCard}>
            <div className={styles.verificationIcon}>
              <IoWarning size={24} />
            </div>
            <div className={styles.verificationContent}>
              <h3>Menunggu Verifikasi</h3>
              <p>
                Akun Anda belum diverifikasi oleh admin. Setelah diverifikasi,
                Anda dapat mengubah pengaturan.
              </p>
            </div>
          </div>
        )}

        {/* Vehicle Info Card */}
        <div
          className={`${styles.card} ${
            settings?.is_verified !== 1 ? styles.disabledCard : ""
          }`}
        >
          <div className={styles.cardHeader}>
            <FaTruck className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Kendaraan</h2>
          </div>

          {settings?.assigned_vehicle_id ? (
            <div className={styles.vehicleInfo}>
              <div className={styles.vehicleMain}>
                <span className={styles.vehicleName}>
                  {settings.vehicle_brand} {settings.vehicle_model}
                </span>
                <span className={styles.vehiclePlate}>
                  {settings.vehicle_license_plate}
                </span>
              </div>
              <div className={styles.vehicleCategory}>
                {settings.vehicle_category}
              </div>
            </div>
          ) : (
            <div className={styles.notAssigned}>
              <p>Kendaraan belum di-assign</p>
              <span>Silahkan pilih kendaraan di halaman awal</span>
            </div>
          )}
        </div>

        {/* Operational Area Card */}
        <div
          className={`${styles.card} ${
            settings?.is_verified !== 1 ? styles.disabledCard : ""
          }`}
        >
          <div className={styles.cardHeader}>
            <FaMapMarkerAlt className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Area Operasional</h2>
          </div>

          <p className={styles.cardDescription}>
            Pilih wilayah tempat Anda akan beroperasi. Anda hanya akan melihat
            request pickup dari wilayah yang dipilih.
          </p>

          <div className={styles.selectorWrapper}>
            <RegencySelector
              value={operationalArea}
              onChange={setOperationalArea}
              label=""
              placeholder="Pilih Area Operasional"
              disabled={settings?.is_verified !== 1}
            />
          </div>

          {operationalArea &&
            operationalArea !== settings?.operational_area && (
              <div className={styles.changeNotice}>
                <span>Perubahan belum disimpan</span>
              </div>
            )}
        </div>

        {/* Save Button */}
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving || !operationalArea || settings?.is_verified !== 1}
        >
          <FaSave />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>

        {/* Info Notice */}
        <div className={styles.notice}>
          <p>
            <strong>Catatan:</strong> Setelah mengatur area operasional, Anda
            hanya akan menerima order dari wilayah tersebut. Pastikan memilih
            area yang sesuai dengan jangkauan operasi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
