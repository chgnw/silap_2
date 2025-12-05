"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./driver.module.css";
import Image from "next/image";
import { showToast } from "@/lib/toastHelper";
import { IoWarning } from "react-icons/io5";

interface Vehicle {
  id: number;
  vehicle_name: string;
  brand: string;
  model: string;
  license_plate: string;
  vin: string;
  max_weight: number;
  status: string;
}

interface DriverInfo {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role_name: string;
  is_verified: boolean;
  is_active: boolean;
  assigned_vehicle_id: number | null;
  active_since: string | null;
}

export default function DriverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTime, setActiveTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch driver info
  const fetchDriverInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/info");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setDriverInfo(data.data);
        setIsActive(data.data.is_active);

        if (data.data.assigned_vehicle_id) {
          // Fetch assigned vehicle details
          const vehicleRes = await fetch(
            `/api/driver/vehicle/${data.data.assigned_vehicle_id}`
          );
          const vehicleData = await vehicleRes.json();
          if (vehicleData.message === "SUCCESS") {
            setSelectedVehicle(vehicleData.data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  }, []);

  // Fetch available vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/vehicles");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverInfo();
      fetchVehicles();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, fetchDriverInfo, fetchVehicles]);

  useEffect(() => {
    if (isActive && driverInfo?.active_since) {
      const interval = setInterval(() => {
        const startTime = new Date(driverInfo.active_since!).getTime();
        const now = Date.now();
        const diff = now - startTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setActiveTime({ hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, driverInfo]);

  const handleActivateDriver = async () => {
    if (!selectedVehicle && !isActive) {
      showToast("error", "Silakan pilih armada terlebih dahulu");
      return;
    }

    setActivating(true);
    try {
      const res = await fetch("/api/driver/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: selectedVehicle?.id,
          activate: !isActive,
        }),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        setIsActive(!isActive);
        await fetchDriverInfo();
      } else {
        showToast("error", data.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Error activating driver:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setActivating(false);
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchTerm("");
    setShowVehicleDropdown(false);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <main className={styles.main}>
        {/* Instructions */}
        {!isActive && (
          <>
            <div className={styles.instructionCard}>
              <div className={styles.instructionIcon}>
                <IoWarning style={{ color: "yellow" }} />
              </div>
              <p>Aktifkan akunmu untuk mendapat pick up order</p>
            </div>

            <div className={styles.instructionCard}>
              <div className={styles.instructionIcon}>
                <IoWarning style={{ color: "yellow" }} />
              </div>
              <p>Pastikan kendaraan selalu bersih dan bahan bakar cukup</p>
            </div>
          </>
        )}

        {!isActive && (
          <div className={styles.selectVehicleSection}>
            <button
              className={styles.selectVehicleButton}
              onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M13 6h5l3 5m-8-5H1v11h2m10-11v11m0-11l-3-3M3 12h2"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                {selectedVehicle
                  ? selectedVehicle.license_plate
                  : "Pilih Armada"}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="white"
                style={{ marginLeft: "auto" }}
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showVehicleDropdown && (
              <div className={styles.dropdown}>
                <input
                  type="text"
                  placeholder="Cari plat nomor..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className={styles.vehicleList}>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={styles.vehicleItem}
                        onClick={() => handleSelectVehicle(vehicle)}
                      >
                        <div className={styles.vehicleItemInfo}>
                          <strong>{vehicle.license_plate}</strong>
                          <span className={styles.vehicleItemDetail}>
                            {vehicle.brand} {vehicle.model} - Max{" "}
                            {vehicle.max_weight} kg
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noVehicles}>
                      Tidak ada kendaraan tersedia
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Driver Info (show when active) */}
        {isActive && driverInfo && (
          <div className={styles.infoCard}>
            <h3 className={styles.sectionTitle}>Informasi Driver</h3>
            <div className={styles.driverCard}>
              <div className={styles.driverAvatar}>
                <Image
                  src="/images/dummy-profile.png"
                  alt="Driver"
                  width={80}
                  height={80}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.driverDetails}>
                <div className={styles.driverName}>
                  {driverInfo.name}
                  {driverInfo.is_verified && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="#2f5e44"
                      style={{ marginLeft: "6px" }}
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
                <div className={styles.driverRole}>{driverInfo.role_name}</div>
                <div className={styles.driverStatus}>Aktif</div>
                <div className={styles.timer}>
                  <div className={styles.timerBox}>
                    {String(activeTime.hours).padStart(2, "0")}
                  </div>
                  <span className={styles.timerSeparator}>:</span>
                  <div className={styles.timerBox}>
                    {String(activeTime.minutes).padStart(2, "0")}
                  </div>
                  <span className={styles.timerSeparator}>:</span>
                  <div className={styles.timerBox}>
                    {String(activeTime.seconds).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Info (show when active and vehicle selected) */}
        {isActive && selectedVehicle && (
          <div className={styles.infoCard}>
            <h3 className={styles.sectionTitle}>Informasi Armada</h3>
            <div className={styles.vehicleCard}>
              <div className={styles.vehicleImage}>
                <Image
                  src="/images/dummy-truck.png"
                  alt="Vehicle"
                  width={120}
                  height={80}
                  className={styles.truckImage}
                />
              </div>
              <div className={styles.vehicleDetails}>
                <div className={styles.vehicleName}>
                  {selectedVehicle.brand} {selectedVehicle.model}
                </div>
                <div className={styles.vehiclePlate}>
                  {selectedVehicle.license_plate}
                </div>
                <div className={styles.vehicleWeight}>
                  Max {selectedVehicle.max_weight} kg
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.activationSection}>
          <button
            className={`${styles.activationButton} ${
              isActive ? styles.active : styles.inactive
            }`}
            onClick={handleActivateDriver}
            disabled={activating || (!selectedVehicle && !isActive)}
          >
            <div className={styles.powerIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path
                  d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
          <div
            className={`${styles.statusLabel} ${
              isActive ? styles.activeLabel : styles.inactiveLabel
            }`}
          >
            {isActive ? "Aktif" : "Non Aktif"}
          </div>
        </div>
      </main>
    </div>
  );
}
