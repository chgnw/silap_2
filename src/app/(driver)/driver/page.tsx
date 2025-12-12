"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./driver.module.css";
import Image from "next/image";
import { showToast } from "@/lib/toastHelper";
import { IoWarning } from "react-icons/io5";
import { FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import RegencySelector from "@/app/components/Medium/RegencySelector/RegencySelector";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  license_plate: string;
  vin: string;
  max_weight: number;
  status: string;
  vehicle_category_id: number;
  category_name: string;
  category_min_weight: number;
  category_max_weight: number | null;
  category_description: string | null;
}

interface DriverInfo {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  role_name: string;
  is_verified: number; // 0 or 1 from database
  is_active: number; // 0 or 1 from database
  total_deliveries: number;
  assigned_vehicle_id: number | null;
  operational_area: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_license_plate: string | null;
  vehicle_status: string | null;
  vehicle_category: string | null;
  vehicle_max_weight: number | null;
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
  const [operationalArea, setOperationalArea] = useState("");
  const [savingArea, setSavingArea] = useState(false);

  // Fetch driver info
  const fetchDriverInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/info");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setDriverInfo(data.data);
        setIsActive(Boolean(data.data.is_active));
        setOperationalArea(data.data.operational_area || "");

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

  // Save operational area
  const saveOperationalArea = async (area: string) => {
    if (!area) return;

    setSavingArea(true);
    try {
      const res = await fetch("/api/driver/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operational_area: area }),
      });

      const data = await res.json();
      if (data.message === "SUCCESS") {
        showToast("success", "Area operasional berhasil disimpan");
      } else {
        showToast("error", data.error || "Gagal menyimpan area operasional");
      }
    } catch (error) {
      console.error("Error saving operational area:", error);
      showToast("error", "Gagal menyimpan area operasional");
    } finally {
      setSavingArea(false);
    }
  };

  // Handle operational area change
  const handleOperationalAreaChange = (area: string) => {
    setOperationalArea(area);
    if (area) {
      saveOperationalArea(area);
    }
  };

  const handleActivateDriver = async () => {
    if (!selectedVehicle && !isActive) {
      showToast("error", "Silakan pilih armada terlebih dahulu");
      return;
    }

    if (!operationalArea && !isActive) {
      showToast("error", "Silakan pilih area operasional terlebih dahulu");
      return;
    }

    setActivating(true);
    try {
      if (isActive) {
        // If deactivating, call logout API
        const res = await fetch("/api/driver/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (data.message === "SUCCESS") {
          setIsActive(false);
          setSelectedVehicle(null);
          await fetchDriverInfo();
          await fetchVehicles();
          showToast(
            "success",
            "Berhasil nonaktif. Armada tersedia untuk driver lain."
          );
        } else {
          showToast("error", data.error || "Gagal mengubah status");
        }
      } else {
        // If activating, assign vehicle
        const res = await fetch("/api/driver/vehicle/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicle_id: selectedVehicle?.id,
          }),
        });

        const data = await res.json();

        if (data.message === "SUCCESS") {
          setIsActive(true);
          await fetchDriverInfo();
          showToast("success", "Berhasil aktif! Anda siap menerima order.");
        } else {
          showToast("error", data.error || "Gagal mengubah status");
        }
      }
    } catch (error) {
      console.error("Error activating driver:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setActivating(false);
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    if (isActive) {
      showToast(
        "error",
        "Nonaktifkan status terlebih dahulu untuk ganti armada"
      );
      return;
    }
    setSelectedVehicle(vehicle);
    setSearchTerm("");
    setShowVehicleDropdown(false);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.category_name.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Verification Status */}
        {driverInfo && driverInfo.is_verified !== 1 && (
          <div className={styles.verificationCard}>
            <div className={styles.verificationIcon}>
              <IoWarning size={24} />
            </div>
            <div className={styles.verificationContent}>
              <h3>Menunggu Verifikasi</h3>
              <p>
                Akun Anda belum diverifikasi oleh admin. Setelah diverifikasi,
                Anda dapat memilih kendaraan, area operasional, dan mulai
                menerima order.
              </p>
            </div>
          </div>
        )}

        {/* Instructions - show if not active */}
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

        {/* Vehicle Selection - show if not active, disabled if not verified */}
        {!isActive && (
          <div
            className={`${styles.selectVehicleSection} ${
              driverInfo?.is_verified !== 1 ? styles.disabledSection : ""
            }`}
          >
            <button
              className={styles.selectVehicleButton}
              onClick={() =>
                driverInfo?.is_verified === 1 &&
                setShowVehicleDropdown(!showVehicleDropdown)
              }
              disabled={driverInfo?.is_verified !== 1}
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
              {selectedVehicle && (
                <FaCheckCircle
                  style={{ color: "#66ea72", marginLeft: "0.5rem" }}
                />
              )}
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

            {showVehicleDropdown && driverInfo?.is_verified === 1 && (
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
                            {vehicle.brand} {vehicle.model}
                          </span>
                          <span className={styles.vehicleCategory}>
                            {vehicle.category_name} • Max{" "}
                            {vehicle.category_max_weight} kg
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

        {/* Operational Area Selection - show if not active, disabled if not verified */}
        {!isActive && (
          <div
            className={`${styles.operationalAreaSection} ${
              driverInfo?.is_verified !== 1 ? styles.disabledSection : ""
            }`}
          >
            <div className={styles.operationalAreaHeader}>
              <FaMapMarkerAlt className={styles.areaIcon} />
              <span>Area Operasional</span>
              {operationalArea && (
                <FaCheckCircle
                  style={{
                    color: "var(--color-primary-dark)",
                  }}
                />
              )}
            </div>
            <div className={styles.regencySelectorWrapper}>
              <RegencySelector
                value={operationalArea}
                onChange={handleOperationalAreaChange}
                label=""
                placeholder="Pilih Area Operasional"
                disabled={savingArea || driverInfo?.is_verified !== 1}
              />
            </div>
            {operationalArea && (
              <div className={styles.selectedAreaInfo}>
                <FaMapMarkerAlt />
                <span>{operationalArea}</span>
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
                  src={
                    driverInfo.profile_picture || "/images/dummy-profile.png"
                  }
                  alt="Driver"
                  width={80}
                  height={80}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.driverDetails}>
                <div className={styles.driverName}>
                  {driverInfo.name}
                  {driverInfo.is_verified === 1 && (
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
                <div className={styles.driverStat}>
                  <span className={styles.statLabel}>Total Pickup:</span>
                  <span className={styles.statValue}>
                    {driverInfo.total_deliveries || 0}
                  </span>
                </div>
                <div className={styles.driverStatus}>
                  Status: {isActive ? "Aktif" : "Non Aktif"}
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
                <div className={styles.vehicleCategory}>
                  {selectedVehicle.category_name}
                </div>
                <div className={styles.vehicleWeight}>
                  Max {selectedVehicle.category_max_weight} kg
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operational Area Info (show when active) */}
        {isActive && operationalArea && (
          <div className={styles.infoCard}>
            <h3 className={styles.sectionTitle}>Area Operasional</h3>
            <div className={styles.operationalAreaCard}>
              <FaMapMarkerAlt className={styles.operationalAreaIcon} />
              <span className={styles.operationalAreaText}>
                {operationalArea}
              </span>
            </div>
          </div>
        )}

        {/* Activation Section - always show, disabled if not verified */}
        <div
          className={`${styles.activationSection} ${
            driverInfo?.is_verified !== 1 ? styles.disabledSection : ""
          }`}
        >
          <button
            className={`${styles.activationButton} ${
              isActive ? styles.active : styles.inactive
            }`}
            onClick={handleActivateDriver}
            disabled={
              activating ||
              driverInfo?.is_verified !== 1 ||
              (!isActive && (!selectedVehicle || !operationalArea))
            }
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
          {driverInfo?.is_verified !== 1 ? (
            <p className={styles.activationHint}>
              Menunggu verifikasi admin untuk mengaktifkan akun
            </p>
          ) : (
            !isActive &&
            (!selectedVehicle || !operationalArea) && (
              <p className={styles.activationHint}>
                {!selectedVehicle && !operationalArea
                  ? "Pilih armada dan area operasional untuk mengaktifkan akun"
                  : !selectedVehicle
                  ? "Pilih armada untuk mengaktifkan akun"
                  : "Pilih area operasional untuk mengaktifkan akun"}
              </p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
