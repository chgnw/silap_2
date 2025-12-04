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
  max_weight: number | null;
  created_at?: string;
  updated_at?: string;
};

type Driver = {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  created_at?: string;
  updated_at?: string;
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
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
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

  const handleActionDriver = (mode: ModalMode, driver?: Driver) => {
    setDriverMode(mode);
    setSelectedDriver(driver || null);

    if (driver) {
      setDriverForm({
        first_name: driver.first_name,
        last_name: driver.last_name || "",
        email: driver.email,
        password: "",
        phone_number: driver.phone_number || "",
        address: driver.address || "",
      });
    } else {
      setDriverForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_number: "",
        address: "",
      });
    }

    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        driverMode === "add"
          ? "/api/admin/driver/add"
          : "/api/admin/driver/update";

      const payload = {
        first_name: driverForm.first_name,
        last_name: driverForm.last_name || null,
        email: driverForm.email,
        password: driverForm.password || undefined,
        phone_number: driverForm.phone_number || null,
        address: driverForm.address || null,
        ...(driverMode === "edit" && { id: selectedDriver?.id }),
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
          `Driver ${driverMode === "add" ? "added" : "updated"} successfully!`
        );
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
        accessorFn: (row) => `${row.first_name} ${row.last_name || ""}`.trim(),
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone_number",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "Address",
        accessorKey: "address",
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
    max_weight: "",
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
        max_weight: vehicle.max_weight?.toString() || "",
      });
    } else {
      setVehicleForm({
        vehicle_name: "",
        max_weight: "",
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
        max_weight: vehicleForm.max_weight
          ? parseFloat(vehicleForm.max_weight)
          : null,
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
        header: "Max Weight (kg)",
        accessorKey: "max_weight",
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value !== null ? value : "-";
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
          onAdd={() => handleActionDriver("add")}
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
        title={`${
          driverMode === "add"
            ? "Add"
            : driverMode === "edit"
            ? "Edit"
            : "Detail"
        } Driver`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveDriver}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name *</label>
              <input
                className={styles.formInput}
                value={driverForm.first_name}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, first_name: e.target.value })
                }
                disabled={driverMode === "view"}
                required
                placeholder="e.g., John"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input
                className={styles.formInput}
                value={driverForm.last_name}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, last_name: e.target.value })
                }
                disabled={driverMode === "view"}
                placeholder="e.g., Doe"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email *</label>
            <input
              type="email"
              className={styles.formInput}
              value={driverForm.email}
              onChange={(e) =>
                setDriverForm({ ...driverForm, email: e.target.value })
              }
              disabled={driverMode === "view"}
              required
              placeholder="e.g., driver@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Password{" "}
              {driverMode === "add" ? "*" : "(leave blank to keep current)"}
            </label>
            <input
              type="password"
              className={styles.formInput}
              value={driverForm.password}
              onChange={(e) =>
                setDriverForm({ ...driverForm, password: e.target.value })
              }
              disabled={driverMode === "view"}
              required={driverMode === "add"}
              placeholder={
                driverMode === "add"
                  ? "Enter password"
                  : "Enter new password (optional)"
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone Number</label>
            <input
              type="tel"
              className={styles.formInput}
              value={driverForm.phone_number}
              onChange={(e) =>
                setDriverForm({ ...driverForm, phone_number: e.target.value })
              }
              disabled={driverMode === "view"}
              placeholder="e.g., +62812345678"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Address</label>
            <textarea
              className={styles.formTextarea}
              value={driverForm.address}
              onChange={(e) =>
                setDriverForm({ ...driverForm, address: e.target.value })
              }
              disabled={driverMode === "view"}
              placeholder="Enter driver address"
              rows={3}
            />
          </div>

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
            <label className={styles.formLabel}>Vehicle Name</label>
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
