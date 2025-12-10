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
  vehicle_name: string;
  brand: string | null;
  model: string | null;
  license_plate: string | null;
  vin: string | null;
  max_weight: number | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
};

type Driver = {
  id: number;
  user_id: number;
  license_number: string | null;
  is_verified: boolean;
  is_available: boolean;
  active_since: string | null;
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
type ActiveTab = "drivers" | "vehicles";

export default function DriversVehiclesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("drivers");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: "driver" | "vehicle";
  } | null>(null);

  // =========================================
  // DRIVERS SECTION
  // =========================================
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverMode, setDriverMode] = useState<ModalMode>("add");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverForm, setDriverForm] = useState({
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
        license_number: driver.license_number || "",
        is_verified: driver.is_verified,
      });
    } else {
      setSelectedDriver(null);
      setDriverForm({
        license_number: "",
        is_verified: false,
      });
    }

    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = "/api/admin/driver/update";

      const payload = {
        id: selectedDriver?.id,
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
        showToast("success", "Driver updated successfully!");
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
        header: "License Number",
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
  // VEHICLES SECTION
  // =========================================
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleMode, setVehicleMode] = useState<ModalMode>("add");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_name: "",
    brand: "",
    model: "",
    license_plate: "",
    vin: "",
    max_weight: "",
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
        vehicle_name: vehicle.vehicle_name,
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        license_plate: vehicle.license_plate || "",
        vin: vehicle.vin || "",
        max_weight: vehicle.max_weight?.toString() || "",
        status: vehicle.status || "available",
      });
    } else {
      setVehicleForm({
        vehicle_name: "",
        brand: "",
        model: "",
        license_plate: "",
        vin: "",
        max_weight: "",
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
        vehicle_name: vehicleForm.vehicle_name,
        brand: vehicleForm.brand || null,
        model: vehicleForm.model || null,
        license_plate: vehicleForm.license_plate || null,
        vin: vehicleForm.vin || null,
        max_weight: vehicleForm.max_weight
          ? parseFloat(vehicleForm.max_weight)
          : null,
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
        header: "Vehicle Name",
        accessorKey: "vehicle_name",
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
        header: "Max Weight (kg)",
        accessorKey: "max_weight",
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value !== null ? value : "-";
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
  const triggerDelete = (id: number, type: "driver" | "vehicle") => {
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
        else fetchVehicles();
      } else {
        showToast("error", result.detail || "Delete failed");
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
    Promise.all([fetchDrivers(), fetchVehicles()]).finally(() =>
      setIsLoading(false)
    );
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
          className={`${styles.tabButton} ${
            activeTab === "drivers" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("drivers")}
        >
          Drivers
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "vehicles" ? styles.activeTab : ""
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
                  value={`${selectedDriver.user.first_name} ${
                    selectedDriver.user.last_name || ""
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

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>License Number</label>
            <input
              className={styles.formInput}
              value={
                driverMode === "view"
                  ? selectedDriver?.license_number || "-"
                  : driverForm.license_number
              }
              onChange={(e) =>
                setDriverForm({ ...driverForm, license_number: e.target.value })
              }
              disabled={driverMode === "view"}
              placeholder="e.g., 1234567890123456"
            />
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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Active Since</label>
                  <input
                    className={styles.formInput}
                    value={
                      selectedDriver?.active_since
                        ? new Date(
                            selectedDriver.active_since
                          ).toLocaleDateString()
                        : "-"
                    }
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Total Deliveries</label>
                  <input
                    className={styles.formInput}
                    value={selectedDriver?.total_deliveries || 0}
                    disabled
                  />
                </div>
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
                <label className={styles.formLabel}>
                  <input
                    type="checkbox"
                    checked={driverForm.is_verified}
                    onChange={(e) =>
                      setDriverForm({
                        ...driverForm,
                        is_verified: e.target.checked,
                      })
                    }
                    style={{ marginRight: "8px" }}
                  />
                  Verified Driver
                </label>
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

      {/* Vehicle Form Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title={`${
          vehicleMode === "add"
            ? "Add"
            : vehicleMode === "edit"
            ? "Edit"
            : "Detail"
        } Vehicle`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveVehicle}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Vehicle Name *</label>
            <input
              className={styles.formInput}
              value={vehicleForm.vehicle_name}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, vehicle_name: e.target.value })
              }
              disabled={vehicleMode === "view"}
              required
              placeholder="e.g., Motor, Mobil, Truk"
            />
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
                placeholder="e.g., Toyota, Honda"
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
                placeholder="e.g., Avanza, Beat"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>License Plate</label>
              <input
                className={styles.formInput}
                value={vehicleForm.license_plate}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    license_plate: e.target.value,
                  })
                }
                disabled={vehicleMode === "view"}
                placeholder="e.g., B 1234 XYZ"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Max Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={vehicleForm.max_weight}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, max_weight: e.target.value })
                }
                disabled={vehicleMode === "view"}
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              VIN (Vehicle Identification Number)
            </label>
            <input
              className={styles.formInput}
              value={vehicleForm.vin}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, vin: e.target.value })
              }
              disabled={vehicleMode === "view"}
              placeholder="e.g., 1HGBH41JXMN109186"
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
              <option value="in_use">In Use</option>
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
    </div>
  );
}
