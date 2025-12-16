"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "./driversVehicles.module.css";

type Vehicle = {
  id: number;
  vehicle_category_id: number | null;
  brand: string | null;
  model: string | null;
  license_plate: string | null;
  vin: string | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
  category?: {
    category_name: string;
    min_weight: number;
    max_weight: number | null;
  };
};

type VehicleCategory = {
  id: number;
  category_name: string;
  min_weight: number;
  max_weight: number | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
};

type Driver = {
  id: number;
  user_id: number;
  id_card_number: string | null;
  license_number: string | null;
  is_verified: boolean;
  is_available: boolean;
  total_deliveries: number;
  assigned_vehicle_id: number | null;
  created_at?: string;
  updated_at?: string;
  user?: {
    first_name: string;
    last_name: string | null;
    email: string;
    phone_number: string | null;
    address: string | null;
  };
};

type ModalMode = "view" | "edit" | "add";
type ActiveTab = "drivers" | "vehicleCategories" | "vehicles";

export default function DriversVehiclesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("drivers");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: "driver" | "vehicleCategory" | "vehicle";
  } | null>(null);

  // Un-verify confirmation modal
  const [isUnverifyModalOpen, setIsUnverifyModalOpen] = useState(false);

  // =========================================
  // DRIVERS SECTION
  // =========================================
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverMode, setDriverMode] = useState<ModalMode>("add");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverForm, setDriverForm] = useState({
    id_card_number: "",
    license_number: "",
    is_verified: false,
  });

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/driver");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setDrivers(result.data || []);
      } else {
        showToast("error", "Failed to fetch drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      showToast("error", "Error fetching drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionDriver = async (mode: ModalMode, driver?: Driver) => {
    setDriverMode(mode);

    if (driver) {
      if (mode === "view") {
        try {
          const response = await fetch("/api/admin/driver/detail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: driver.id }),
          });
          const result = await response.json();

          if (result.message === "SUCCESS") {
            setSelectedDriver(result.data);
          } else {
            setSelectedDriver(driver);
          }
        } catch (error) {
          console.error("Error fetching driver details:", error);
          setSelectedDriver(driver);
        }
      } else {
        setSelectedDriver(driver);
      }

      setDriverForm({
        id_card_number: driver.id_card_number || "",
        license_number: driver.license_number || "",
        is_verified: driver.is_verified,
      });
    } else {
      setSelectedDriver(null);
      setDriverForm({
        id_card_number: "",
        license_number: "",
        is_verified: false,
      });
    }

    setIsDriverModalOpen(true);
  };

  // Check if trying to un-verify
  const isUnverifying = selectedDriver?.is_verified && !driverForm.is_verified;

  const handleToggleVerified = (checked: boolean) => {
    if (!checked && selectedDriver?.is_verified) {
      // Trying to un-verify, show confirmation
      setIsUnverifyModalOpen(true);
    } else {
      setDriverForm({
        ...driverForm,
        is_verified: checked,
      });
    }
  };

  const confirmUnverify = () => {
    setDriverForm({
      ...driverForm,
      is_verified: false,
    });
    setIsUnverifyModalOpen(false);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = "/api/admin/driver/update";

      const payload = {
        id: selectedDriver?.id,
        id_card_number: driverForm.id_card_number || null,
        license_number: driverForm.license_number || null,
        is_verified: driverForm.is_verified,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        if (result.reset) {
          showToast(
            "success",
            "Driver di-unverify dan semua data telah direset!"
          );
        } else {
          showToast("success", "Driver updated successfully!");
        }
        setIsDriverModalOpen(false);
        fetchDrivers();
      } else {
        showToast("error", result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving driver:", error);
      showToast("error", "Error saving driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsDrivers = useMemo<ColumnDef<Driver>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Name",
        accessorFn: (row) => {
          if (row.user) {
            return `${row.user.first_name} ${row.user.last_name || ""}`.trim();
          }
          return "-";
        },
      },
      {
        header: "Email",
        accessorFn: (row) => row.user?.email || "-",
      },
      {
        header: "ID Card (No. KTP)",
        accessorKey: "id_card_number",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? `${value.slice(0, 4)}...${value.slice(-4)}` : "-";
        },
      },
      {
        header: "License (No. SIM)",
        accessorKey: "license_number",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "Verified",
        accessorKey: "is_verified",
        cell: ({ getValue }) => {
          const value = getValue() as boolean;
          return (
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.85rem",
                fontWeight: "500",
                backgroundColor: value ? "#d4edda" : "#f8d7da",
                color: value ? "#155724" : "#721c24",
              }}
            >
              {value ? "Verified" : "Unverified"}
            </span>
          );
        },
      },
      {
        header: "Available",
        accessorKey: "is_available",
        cell: ({ getValue }) => {
          const value = getValue() as boolean;
          return value ? "Yes" : "No";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleActionDriver("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleActionDriver("edit", row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => triggerDelete(row.original.id, "driver")}
              className={`${styles.btnAction} ${styles.btnDelete}`}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // =========================================
  // VEHICLE CATEGORIES SECTION
  // =========================================
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(
    []
  );
  const [isVehicleCategoryModalOpen, setIsVehicleCategoryModalOpen] =
    useState(false);
  const [vehicleCategoryMode, setVehicleCategoryMode] =
    useState<ModalMode>("add");
  const [selectedVehicleCategory, setSelectedVehicleCategory] =
    useState<VehicleCategory | null>(null);
  const [vehicleCategoryForm, setVehicleCategoryForm] = useState({
    category_name: "",
    min_weight: "",
    max_weight: "",
    description: "",
  });

  const fetchVehicleCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/vehicle-category");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setVehicleCategories(result.data || []);
      } else {
        showToast("error", "Failed to fetch vehicle categories");
      }
    } catch (error) {
      console.error("Error fetching vehicle categories:", error);
      showToast("error", "Error fetching vehicle categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionVehicleCategory = (
    mode: ModalMode,
    category?: VehicleCategory
  ) => {
    setVehicleCategoryMode(mode);
    setSelectedVehicleCategory(category || null);

    if (category) {
      setVehicleCategoryForm({
        category_name: category.category_name,
        min_weight: category.min_weight?.toString() || "",
        max_weight: category.max_weight?.toString() || "",
        description: category.description || "",
      });
    } else {
      setVehicleCategoryForm({
        category_name: "",
        min_weight: "",
        max_weight: "",
        description: "",
      });
    }

    setIsVehicleCategoryModalOpen(true);
  };

  const handleSaveVehicleCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        vehicleCategoryMode === "add"
          ? "/api/admin/vehicle-category/add"
          : "/api/admin/vehicle-category/update";

      const payload = {
        category_name: vehicleCategoryForm.category_name,
        min_weight: vehicleCategoryForm.min_weight
          ? parseFloat(vehicleCategoryForm.min_weight)
          : 0,
        max_weight: vehicleCategoryForm.max_weight
          ? parseFloat(vehicleCategoryForm.max_weight)
          : null,
        description: vehicleCategoryForm.description || null,
        ...(vehicleCategoryMode === "edit" && {
          id: selectedVehicleCategory?.id,
        }),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `Vehicle category ${vehicleCategoryMode === "add" ? "added" : "updated"
          } successfully!`
        );
        setIsVehicleCategoryModalOpen(false);
        fetchVehicleCategories();
      } else {
        showToast("error", result.detail || result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving vehicle category:", error);
      showToast("error", "Error saving vehicle category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsVehicleCategories = useMemo<ColumnDef<VehicleCategory>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Category Name",
        accessorKey: "category_name",
      },
      {
        header: "Min Weight (kg)",
        accessorKey: "min_weight",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value !== null ? value : "-";
        },
      },
      {
        header: "Max Weight (kg)",
        accessorKey: "max_weight",
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value !== null ? value : "Unlimited";
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleActionVehicleCategory("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleActionVehicleCategory("edit", row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => triggerDelete(row.original.id, "vehicleCategory")}
              className={`${styles.btnAction} ${styles.btnDelete}`}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // =========================================
  // VEHICLES SECTION
  // =========================================
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleMode, setVehicleMode] = useState<ModalMode>("add");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_category_id: "",
    brand: "",
    model: "",
    license_plate: "",
    vin: "",
    status: "available",
  });

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/vehicle");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setVehicles(result.data || []);
      } else {
        showToast("error", "Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showToast("error", "Error fetching vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionVehicle = (mode: ModalMode, vehicle?: Vehicle) => {
    setVehicleMode(mode);
    setSelectedVehicle(vehicle || null);

    if (vehicle) {
      setVehicleForm({
        vehicle_category_id: vehicle.vehicle_category_id?.toString() || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        license_plate: vehicle.license_plate || "",
        vin: vehicle.vin || "",
        status: vehicle.status || "available",
      });
    } else {
      setVehicleForm({
        vehicle_category_id: "",
        brand: "",
        model: "",
        license_plate: "",
        vin: "",
        status: "available",
      });
    }

    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        vehicleMode === "add"
          ? "/api/admin/vehicle/add"
          : "/api/admin/vehicle/update";

      const payload = {
        vehicle_category_id: vehicleForm.vehicle_category_id
          ? parseInt(vehicleForm.vehicle_category_id)
          : null,
        brand: vehicleForm.brand || null,
        model: vehicleForm.model || null,
        license_plate: vehicleForm.license_plate || null,
        vin: vehicleForm.vin || null,
        status: vehicleForm.status || "available",
        ...(vehicleMode === "edit" && { id: selectedVehicle?.id }),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `Vehicle ${vehicleMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsVehicleModalOpen(false);
        fetchVehicles();
      } else {
        showToast("error", result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      showToast("error", "Error saving vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsVehicles = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Vehicle Category",
        accessorFn: (row) => row.category?.category_name || "-",
      },
      {
        header: "Brand",
        accessorKey: "brand",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "Model",
        accessorKey: "model",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "License Plate",
        accessorKey: "license_plate",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "Min Weight (kg)",
        accessorFn: (row) => {
          return row.category?.min_weight !== undefined
            ? row.category.min_weight
            : "-";
        },
      },
      {
        header: "Max Weight (kg)",
        accessorFn: (row) => {
          if (!row.category) return "-";
          return row.category.max_weight !== null
            ? row.category.max_weight
            : "Unlimited";
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleActionVehicle("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleActionVehicle("edit", row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => triggerDelete(row.original.id, "vehicle")}
              className={`${styles.btnAction} ${styles.btnDelete}`}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // =========================================
  // DELETE LOGIC
  // =========================================
  const triggerDelete = (
    id: number,
    type: "driver" | "vehicleCategory" | "vehicle"
  ) => {
    setDeleteTarget({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      const endpoint =
        deleteTarget.type === "driver"
          ? "/api/admin/driver/delete"
          : deleteTarget.type === "vehicleCategory"
            ? "/api/admin/vehicle-category/delete"
            : "/api/admin/vehicle/delete";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Deleted successfully!");
        setIsDeleteModalOpen(false);

        if (deleteTarget.type === "driver") fetchDrivers();
        else if (deleteTarget.type === "vehicleCategory")
          fetchVehicleCategories();
        else fetchVehicles();
      } else {
        showToast("error", result.detail || result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("error", "Error deleting data");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchDrivers(),
      fetchVehicleCategories(),
      fetchVehicles(),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Driver & Vehicle Management</h1>
        <i className={styles.pageSubtitle}>
          Manage drivers and vehicle configurations for pickup operations.
        </i>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "drivers" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("drivers")}
        >
          Drivers
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "vehicleCategories" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("vehicleCategories")}
        >
          Vehicle Categories
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "vehicles" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("vehicles")}
        >
          Vehicles
        </button>
      </div>

      {activeTab === "drivers" ? (
        <AdminTable
          columns={columnsDrivers}
          data={drivers}
          isLoading={isLoading}
        />
      ) : activeTab === "vehicleCategories" ? (
        <AdminTable
          columns={columnsVehicleCategories}
          data={vehicleCategories}
          isLoading={isLoading}
          onAdd={() => handleActionVehicleCategory("add")}
        />
      ) : (
        <AdminTable
          columns={columnsVehicles}
          data={vehicles}
          isLoading={isLoading}
          onAdd={() => handleActionVehicle("add")}
        />
      )}

      {/* Driver Form Modal */}
      <Modal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        title={`${driverMode === "edit" ? "Edit" : "Detail"} Driver`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveDriver}>
          {driverMode === "view" && selectedDriver?.user && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  className={styles.formInput}
                  value={`${selectedDriver.user.first_name} ${selectedDriver.user.last_name || ""
                    }`.trim()}
                  disabled
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    value={selectedDriver.user.email}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input
                    className={styles.formInput}
                    value={selectedDriver.user.phone_number || "-"}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <textarea
                  className={styles.formTextarea}
                  value={selectedDriver.user.address || "-"}
                  disabled
                  rows={2}
                />
              </div>

              <hr style={{ margin: "1rem 0", border: "1px solid #e0e0e0" }} />
            </>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ID Card Number (KTP)</label>
              <input
                className={styles.formInput}
                value={
                  driverMode === "view"
                    ? selectedDriver?.id_card_number || "-"
                    : driverForm.id_card_number
                }
                onChange={(e) =>
                  setDriverForm({
                    ...driverForm,
                    id_card_number: e.target.value,
                  })
                }
                disabled={driverMode === "view"}
                placeholder="e.g., 3201234567890001"
                minLength={16}
                maxLength={16}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>License Number (SIM)</label>
              <input
                className={styles.formInput}
                value={
                  driverMode === "view"
                    ? selectedDriver?.license_number || "-"
                    : driverForm.license_number
                }
                onChange={(e) =>
                  setDriverForm({
                    ...driverForm,
                    license_number: e.target.value,
                  })
                }
                disabled={driverMode === "view"}
                placeholder="e.g., 1234567890123456"
                minLength={16}
                maxLength={16}
              />
            </div>
          </div>

          {driverMode === "view" ? (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Verified</label>
                  <input
                    className={styles.formInput}
                    value={selectedDriver?.is_verified ? "Yes" : "No"}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Available</label>
                  <input
                    className={styles.formInput}
                    value={selectedDriver?.is_available ? "Yes" : "No"}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Deliveries</label>
                <input
                  className={styles.formInput}
                  value={selectedDriver?.total_deliveries || 0}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assigned Vehicle ID</label>
                <input
                  className={styles.formInput}
                  value={selectedDriver?.assigned_vehicle_id || "-"}
                  disabled
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                {(() => {
                  const missingFields: string[] = [];
                  if (!driverForm.id_card_number)
                    missingFields.push("ID Card Number (KTP)");
                  if (!driverForm.license_number)
                    missingFields.push("License Number (SIM)");
                  const canVerify = missingFields.length === 0;

                  return (
                    <>
                      <div className={styles.toggleContainer}>
                        <label
                          className={`${styles.toggleSwitch} ${!canVerify && !driverForm.is_verified
                            ? styles.toggleDisabled
                            : ""
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={driverForm.is_verified}
                            onChange={(e) => {
                              if (canVerify || !e.target.checked) {
                                handleToggleVerified(e.target.checked);
                              }
                            }}
                            disabled={!canVerify && !driverForm.is_verified}
                          />
                          <span className={styles.toggleSlider}></span>
                        </label>
                        <span className={styles.toggleLabel}>
                          Verified Driver
                        </span>
                      </div>
                      {!canVerify && !driverForm.is_verified && (
                        <p className={styles.verificationWarning}>
                          *{missingFields.join(" and ")}{" "}
                          {missingFields.length > 1 ? "are" : "is"} required to
                          verify this driver
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}

          <div className={styles.modalFooter}>
            {driverMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsDriverModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className={`${styles.btnBase} ${styles.btnCancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btnBase} ${styles.btnSave}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Vehicle Category Form Modal */}
      <Modal
        isOpen={isVehicleCategoryModalOpen}
        onClose={() => setIsVehicleCategoryModalOpen(false)}
        title={`${vehicleCategoryMode === "add"
          ? "Add"
          : vehicleCategoryMode === "edit"
            ? "Edit"
            : "Detail"
          } Vehicle Category`}
      >
        <form
          className={styles.singleLayout}
          onSubmit={handleSaveVehicleCategory}
        >
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category Name *</label>
            <input
              className={styles.formInput}
              value={vehicleCategoryForm.category_name}
              onChange={(e) =>
                setVehicleCategoryForm({
                  ...vehicleCategoryForm,
                  category_name: e.target.value,
                })
              }
              disabled={vehicleCategoryMode === "view"}
              required
              placeholder="e.g., Motor, Mobil Kecil, Truk"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Min Weight (kg) *</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={vehicleCategoryForm.min_weight}
                onChange={(e) =>
                  setVehicleCategoryForm({
                    ...vehicleCategoryForm,
                    min_weight: e.target.value,
                  })
                }
                disabled={vehicleCategoryMode === "view"}
                required
                placeholder="e.g., 0"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Max Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={vehicleCategoryForm.max_weight}
                onChange={(e) =>
                  setVehicleCategoryForm({
                    ...vehicleCategoryForm,
                    max_weight: e.target.value,
                  })
                }
                disabled={vehicleCategoryMode === "view"}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              className={styles.formTextarea}
              value={vehicleCategoryForm.description}
              onChange={(e) =>
                setVehicleCategoryForm({
                  ...vehicleCategoryForm,
                  description: e.target.value,
                })
              }
              disabled={vehicleCategoryMode === "view"}
              rows={3}
              placeholder="e.g., Kendaraan roda dua untuk pickup sampah ringan"
            />
          </div>

          <div className={styles.modalFooter}>
            {vehicleCategoryMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsVehicleCategoryModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsVehicleCategoryModalOpen(false)}
                  className={`${styles.btnBase} ${styles.btnCancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btnBase} ${styles.btnSave}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Vehicle Form Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title={`${vehicleMode === "add"
          ? "Add"
          : vehicleMode === "edit"
            ? "Edit"
            : "Detail"
          } Vehicle`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveVehicle}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Vehicle Category *</label>
            {vehicleMode === "view" ? (
              <input
                className={styles.formInput}
                value={selectedVehicle?.category?.category_name || "-"}
                disabled
              />
            ) : (
              <select
                className={styles.formInput}
                value={vehicleForm.vehicle_category_id}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    vehicle_category_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select a category</option>
                {vehicleCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Brand</label>
              <input
                className={styles.formInput}
                value={vehicleForm.brand}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, brand: e.target.value })
                }
                disabled={vehicleMode === "view"}
                placeholder="e.g., Toyota, Hino"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Model</label>
              <input
                className={styles.formInput}
                value={vehicleForm.model}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, model: e.target.value })
                }
                disabled={vehicleMode === "view"}
                placeholder="e.g., Hilux, Dutro"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>License Plate</label>
            <input
              className={styles.formInput}
              value={vehicleForm.license_plate}
              onChange={(e) =>
                setVehicleForm({
                  ...vehicleForm,
                  license_plate: e.target.value.replace(/\s/g, "").toUpperCase(),
                })
              }
              disabled={vehicleMode === "view"}
              placeholder="e.g., B1234XYZ"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              VIN (Vehicle Identification Number)
            </label>
            <input
              className={styles.formInput}
              value={vehicleForm.vin}
              onChange={(e) =>
                setVehicleForm({
                  ...vehicleForm,
                  vin: e.target.value.replace(/\s/g, "").toUpperCase(),
                })
              }
              disabled={vehicleMode === "view"}
              placeholder="e.g., 1HGBH41JXMN109186"
              maxLength={17}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select
              className={styles.formInput}
              value={vehicleForm.status}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, status: e.target.value })
              }
              disabled={vehicleMode === "view"}
            >
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className={styles.modalFooter}>
            {vehicleMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className={`${styles.btnBase} ${styles.btnCancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btnBase} ${styles.btnSave}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className={styles.singleLayout}>
          <div>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Are you sure you want to delete this {deleteTarget?.type}?
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              This action cannot be undone.
            </p>
          </div>

          <div
            className={styles.modalFooter}
            style={{ width: "100%", borderTop: "none" }}
          >
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className={`${styles.btnBase} ${styles.btnCancel}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className={`${styles.btnBase} ${styles.btnDeleteConfirm}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Un-verify Confirmation Modal */}
      <Modal
        isOpen={isUnverifyModalOpen}
        onClose={() => setIsUnverifyModalOpen(false)}
        title="Konfirmasi Un-verify Driver"
      >
        <div className={styles.singleLayout}>
          <div>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Apakah Anda yakin ingin un-verify driver ini?
            </p>
            <div
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#856404",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                ⚠️ Perhatian:
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "#856404",
                  margin: 0,
                  paddingLeft: "1.2rem",
                }}
              >
                <li>Status driver akan menjadi non-aktif</li>
                <li>Kendaraan yang di-assign akan dilepas</li>
                <li>Area operasional akan direset</li>
                <li>Driver harus setup ulang setelah di-verify kembali</li>
              </ul>
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#dc2626",
                marginTop: "1rem",
                fontStyle: "italic",
              }}
            >
              * Jika driver sedang memiliki order aktif, proses un-verify akan
              ditolak sampai semua order selesai.
            </p>
          </div>

          <div
            className={styles.modalFooter}
            style={{ width: "100%", borderTop: "none" }}
          >
            <button
              type="button"
              onClick={() => setIsUnverifyModalOpen(false)}
              className={`${styles.btnBase} ${styles.btnCancel}`}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmUnverify}
              className={`${styles.btnBase} ${styles.btnDeleteConfirm}`}
            >
              Ya, Un-verify
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
