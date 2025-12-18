"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "./others.module.css";

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

type FAQ = {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

type ModalMode = "view" | "edit" | "add";
type ActiveTab = "tiers" | "faqs";

export default function OthersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tiers");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // TIERS SECTION
  // =========================================
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [tierForm, setTierForm] = useState({
    tier_name: "",
    tier_icon: "",
    min_weight: "",
    max_weight: "",
    target_weight: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // =========================================
  // FAQ SECTION
  // =========================================
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState<ModalMode>("add");
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isFaqDeleteModalOpen, setIsFaqDeleteModalOpen] = useState(false);
  const [faqDeleteTarget, setFaqDeleteTarget] = useState<number | null>(null);

  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    is_active: true,
    sort_order: "0",
  });

  // =========================================
  // FETCH FUNCTIONS
  // =========================================
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

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/faq");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setFaqs(result.data || []);
      } else {
        showToast("error", "Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showToast("error", "Error fetching FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // TIER ACTIONS
  // =========================================
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

      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast("error", "File size too large. Maximum size is 3MB");
        return;
      }

      setSelectedFile(file);
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

  // =========================================
  // FAQ ACTIONS
  // =========================================
  const handleFaqAction = (mode: ModalMode, faq?: FAQ) => {
    setFaqModalMode(mode);
    setSelectedFaq(faq || null);

    if (faq) {
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active,
        sort_order: faq.sort_order.toString(),
      });
    } else {
      setFaqForm({
        question: "",
        answer: "",
        is_active: true,
        sort_order: "0",
      });
    }

    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        faqModalMode === "add"
          ? "/api/admin/faq/add"
          : "/api/admin/faq/update";

      const payload = {
        question: faqForm.question,
        answer: faqForm.answer,
        is_active: faqForm.is_active,
        sort_order: parseInt(faqForm.sort_order),
        ...(faqModalMode === "edit" && { id: selectedFaq?.id }),
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
          `FAQ ${faqModalMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsFaqModalOpen(false);
        fetchFaqs();
      } else {
        showToast("error", result.error || result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showToast("error", "Error saving FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDeleteFaq = (id: number) => {
    setFaqDeleteTarget(id);
    setIsFaqDeleteModalOpen(true);
  };

  const confirmDeleteFaq = async () => {
    if (!faqDeleteTarget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/faq/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faqDeleteTarget }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "FAQ deleted successfully!");
        setIsFaqDeleteModalOpen(false);
        fetchFaqs();
      } else {
        showToast("error", result.error || result.detail || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showToast("error", "Error deleting FAQ");
    } finally {
      setIsSubmitting(false);
      setFaqDeleteTarget(null);
    }
  };

  // =========================================
  // COLUMNS
  // =========================================
  const columnsTiers = useMemo<ColumnDef<Tier>[]>(
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.insertAdjacentHTML("afterend", '<span style="color:#999;font-size:0.8rem">File not found</span>');
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
    fetchFaqs();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Others Management</h1>
        <i className={styles.pageSubtitle}>
          Manage customer tiers and frequently asked questions.
        </i>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "tiers" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("tiers")}
        >
          Customer Tiers
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "faqs" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("faqs")}
        >
          FAQ
        </button>
      </div>

      {activeTab === "tiers" ? (
        <AdminTable
          columns={columnsTiers}
          data={tiers}
          isLoading={isLoading}
          onAdd={() => handleAction("add")}
        />
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button
              onClick={() => handleFaqAction("add")}
              className={`${styles.btnBase} ${styles.btnSave}`}
              style={{ padding: "0.6rem 1.5rem" }}
            >
              + Add FAQ
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              Loading FAQs...
            </div>
          ) : faqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              No FAQs found. Click "Add FAQ" to create one.
            </div>
          ) : (
            <div className={styles.faqGrid}>
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={styles.faqCard}
                  onClick={() => handleFaqAction("view", faq)}
                >
                  <div className={styles.faqContent}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswerPreview}>
                      {faq.answer.length > 120
                        ? `${faq.answer.substring(0, 120)}...`
                        : faq.answer}
                    </p>
                    {!faq.is_active && (
                      <span className={styles.faqInactiveBadge}>Inactive</span>
                    )}
                  </div>
                  <div className={styles.faqActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFaqAction("edit", faq);
                      }}
                      className={`${styles.btnAction} ${styles.btnEdit}`}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerDeleteFaq(faq.id);
                      }}
                      className={`${styles.btnAction} ${styles.btnDelete}`}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tier Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === "add" ? "Add" : modalMode === "edit" ? "Edit" : "Detail"
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.insertAdjacentHTML("afterend", '<p style="color:#dc2626;font-size:0.9rem;font-style:italic">File not found</p>');
                      }}
                    />
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
                <small style={{ color: "#666", fontSize: "0.85rem" }}>
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.insertAdjacentHTML("afterend", '<p style="color:#dc2626;font-size:0.9rem;font-style:italic">File not found</p>');
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

      {/* Delete Tier Modal */}
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

      {/* FAQ Form Modal */}
      <Modal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        title={`${faqModalMode === "add" ? "Add" : faqModalMode === "edit" ? "Edit" : "View"
          } FAQ`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveFaq}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Question *</label>
            <textarea
              className={styles.formTextarea}
              value={faqForm.question}
              onChange={(e) =>
                setFaqForm({ ...faqForm, question: e.target.value })
              }
              disabled={faqModalMode === "view"}
              required
              rows={2}
              placeholder="Enter the question..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Answer *</label>
            <textarea
              className={styles.formTextarea}
              value={faqForm.answer}
              onChange={(e) =>
                setFaqForm({ ...faqForm, answer: e.target.value })
              }
              disabled={faqModalMode === "view"}
              required
              rows={5}
              placeholder="Enter the answer..."
            />
          </div>

          {faqModalMode !== "view" && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sort Order</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={faqForm.sort_order}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, sort_order: e.target.value })
                    }
                    placeholder="0"
                  />
                  <small style={{ color: "#666", fontSize: "0.85rem" }}>
                    Lower numbers appear first
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <div className={styles.toggleContainer}>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={faqForm.is_active}
                        onChange={(e) =>
                          setFaqForm({ ...faqForm, is_active: e.target.checked })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                    <span className={styles.toggleLabel}>
                      {faqForm.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className={styles.modalFooter}>
            {faqModalMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
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

      {/* Delete FAQ Modal */}
      <Modal
        isOpen={isFaqDeleteModalOpen}
        onClose={() => !isSubmitting && setIsFaqDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className={styles.singleLayout}>
          <div>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Are you sure you want to delete this FAQ?
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
              onClick={() => setIsFaqDeleteModalOpen(false)}
              className={`${styles.btnBase} ${styles.btnCancel}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteFaq}
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
