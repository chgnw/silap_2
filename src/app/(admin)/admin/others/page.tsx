"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "../drivers-vehicles/driversVehicles.module.css";

type Tier = {
  id: number;
  tier_name: string;
  tier_icon: string | null;
  min_weight: number;
  max_weight: number | null;
  target_weight: number | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
};

type ModalMode = "view" | "edit" | "add";

export default function OthersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Form state
  const [tierForm, setTierForm] = useState({
    tier_name: "",
    tier_icon: "",
    min_weight: "",
    max_weight: "",
    target_weight: "",
    description: "",
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fetchTiers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/tier");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setTiers(result.data || []);
      } else {
        showToast("error", "Failed to fetch tiers");
      }
    } catch (error) {
      console.error("Error fetching tiers:", error);
      showToast("error", "Error fetching tiers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (mode: ModalMode, tier?: Tier) => {
    setModalMode(mode);
    setSelectedTier(tier || null);

    if (tier) {
      setTierForm({
        tier_name: tier.tier_name,
        tier_icon: tier.tier_icon || "",
        min_weight: tier.min_weight.toString(),
        max_weight: tier.max_weight?.toString() || "",
        target_weight: tier.target_weight?.toString() || "",
        description: tier.description || "",
      });
      setPreviewUrl(tier.tier_icon || "");
    } else {
      setTierForm({
        tier_name: "",
        tier_icon: "",
        min_weight: "",
        max_weight: "",
        target_weight: "",
        description: "",
      });
      setPreviewUrl("");
    }

    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "error",
          "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed"
        );
        return;
      }

      // Validate file size (max 3MB)
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast("error", "File size too large. Maximum size is 3MB");
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        modalMode === "add" ? "/api/admin/tier/add" : "/api/admin/tier/update";

      const formData = new FormData();
      formData.append("tier_name", tierForm.tier_name);
      formData.append("min_weight", tierForm.min_weight);
      formData.append("max_weight", tierForm.max_weight || "");
      formData.append("target_weight", tierForm.target_weight || "");
      formData.append("description", tierForm.description || "");

      if (modalMode === "edit" && selectedTier?.id) {
        formData.append("id", selectedTier.id.toString());
        formData.append("existing_icon", tierForm.tier_icon || "");
      }

      if (selectedFile) {
        formData.append("tier_icon", selectedFile);
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `Tier ${modalMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsModalOpen(false);
        fetchTiers();
      } else {
        showToast("error", result.error || result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving tier:", error);
      showToast("error", "Error saving tier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (id: number) => {
    setDeleteTarget(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/tier/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Tier deleted successfully!");
        setIsDeleteModalOpen(false);
        fetchTiers();
      } else {
        showToast("error", result.error || result.detail || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting tier:", error);
      showToast("error", "Error deleting tier");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<Tier>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Icon",
        accessorKey: "tier_icon",
        cell: ({ getValue }) => {
          const iconUrl = getValue() as string | null;
          return iconUrl ? (
            <img
              src={iconUrl}
              alt="Tier icon"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          ) : (
            <span style={{ color: "#999", fontSize: "0.9rem" }}>No icon</span>
          );
        },
        size: 80,
      },
      {
        header: "Tier Name",
        accessorKey: "tier_name",
      },
      {
        header: "Min Weight (kg)",
        accessorKey: "min_weight",
        cell: ({ getValue }) => {
          const value = getValue();
          return value !== null && value !== undefined
            ? parseFloat(value as string).toFixed(2)
            : "0.00";
        },
      },
      {
        header: "Max Weight (kg)",
        accessorKey: "max_weight",
        cell: ({ getValue }) => {
          const value = getValue();
          return value !== null && value !== undefined
            ? parseFloat(value as string).toFixed(2)
            : "∞";
        },
      },
      {
        header: "Target Weight (kg)",
        accessorKey: "target_weight",
        cell: ({ getValue }) => {
          const value = getValue();
          return value !== null && value !== undefined
            ? parseFloat(value as string).toFixed(2)
            : "-";
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
              onClick={() => handleAction("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleAction("edit", row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => triggerDelete(row.original.id)}
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

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Customer Tier Management</h1>
        <i className={styles.pageSubtitle}>
          Manage customer tier list with gamification targets for loyalty
          system.
        </i>
      </div>

      <AdminTable
        columns={columns}
        data={tiers}
        isLoading={isLoading}
        onAdd={() => handleAction("add")}
      />

      {/* Tier Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${
          modalMode === "add" ? "Add" : modalMode === "edit" ? "Edit" : "Detail"
        } Tier`}
      >
        <form className={styles.singleLayout} onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tier Name *</label>
            <input
              className={styles.formInput}
              value={tierForm.tier_name}
              onChange={(e) =>
                setTierForm({ ...tierForm, tier_name: e.target.value })
              }
              disabled={modalMode === "view"}
              required
              placeholder="e.g., Bronze, Silver, Gold"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tier Icon</label>
            {modalMode === "view" ? (
              <div>
                {tierForm.tier_icon ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={tierForm.tier_icon}
                      alt="Tier icon"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "8px",
                        backgroundColor: "#f9f9f9",
                      }}
                    />
                    <small style={{ color: "#666", fontSize: "0.85rem" }}>
                      File: {tierForm.tier_icon.split("/").pop()}
                    </small>
                  </div>
                ) : (
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>
                    No icon uploaded
                  </p>
                )}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className={styles.formInput}
                  style={{ padding: "8px" }}
                />
                <small
                  style={{
                    color: "#666",
                    fontSize: "0.85rem",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  Accepted formats: JPEG, PNG, WebP, SVG. Max size: 3MB
                </small>
                {previewUrl && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={previewUrl}
                      alt="Icon preview"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "8px",
                        backgroundColor: "#f9f9f9",
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Min Weight (kg) *</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={tierForm.min_weight}
                onChange={(e) =>
                  setTierForm({ ...tierForm, min_weight: e.target.value })
                }
                disabled={modalMode === "view"}
                required
                placeholder="0.00"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Max Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={tierForm.max_weight}
                onChange={(e) =>
                  setTierForm({ ...tierForm, max_weight: e.target.value })
                }
                disabled={modalMode === "view"}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Target Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              className={styles.formInput}
              value={tierForm.target_weight}
              onChange={(e) =>
                setTierForm({ ...tierForm, target_weight: e.target.value })
              }
              disabled={modalMode === "view"}
              placeholder="Target sampah per bulan"
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Target berat sampah yang harus dikumpulkan per bulan
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              className={styles.formTextarea}
              value={tierForm.description}
              onChange={(e) =>
                setTierForm({ ...tierForm, description: e.target.value })
              }
              disabled={modalMode === "view"}
              rows={3}
              placeholder="Deskripsi tier level ini..."
            />
          </div>

          <div className={styles.modalFooter}>
            {modalMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
              Are you sure you want to delete this tier?
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
