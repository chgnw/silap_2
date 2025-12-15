"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "../drivers-vehicles/driversVehicles.module.css";

type SubscriptionPlan = {
  id: number;
  plan_name: string;
  description: string | null;
  price: number;
  duration_days: number;
  pickup_frequency: string | null;
  max_weight: number | null;
  created_at?: string;
  updated_at?: string;
};

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

type PendingPayment = {
  id: number;
  transaction_code: string;
  user_id: number;
  subscription_plan_id: number;
  payment_type: string;
  payment_method: string | null;
  payment_proof_url: string | null;
  total_payment: number;
  transaction_status_id: number;
  payment_time: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  plan_name: string;
  price: number;
  duration_days: number;
  pickup_frequency: string | null;
  transaction_status_name: string;
};

type ModalMode = "view" | "edit" | "add";
type ActiveTab = "subscriptions" | "pendingPayments" | "tiers";

export default function OthersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscriptions");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // SUBSCRIPTION PLANS SECTION
  // =========================================
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<ModalMode>("add");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanDeleteModalOpen, setIsPlanDeleteModalOpen] = useState(false);
  const [planDeleteTarget, setPlanDeleteTarget] = useState<number | null>(null);

  const [planForm, setPlanForm] = useState({
    plan_name: "",
    description: "",
    price: "",
    duration_days: "",
    pickup_frequency: "",
    max_weight: "",
  });

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
  // PENDING PAYMENTS SECTION
  // =========================================
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [referenceError, setReferenceError] = useState("");

  // =========================================
  // FETCH FUNCTIONS
  // =========================================
  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/subscription-plan");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setSubscriptionPlans(result.data || []);
      } else {
        showToast("error", "Failed to fetch subscription plans");
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      showToast("error", "Error fetching subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/subscription");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setPendingPayments(result.data || []);
      } else {
        showToast("error", "Failed to fetch pending payments");
      }
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      showToast("error", "Error fetching pending payments");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // SUBSCRIPTION PLANS ACTIONS
  // =========================================
  const handleActionPlan = (mode: ModalMode, plan?: SubscriptionPlan) => {
    setPlanModalMode(mode);
    setSelectedPlan(plan || null);

    if (plan) {
      setPlanForm({
        plan_name: plan.plan_name,
        description: plan.description || "",
        price: plan.price.toString(),
        duration_days: plan.duration_days.toString(),
        pickup_frequency: plan.pickup_frequency || "",
        max_weight: plan.max_weight?.toString() || "",
      });
    } else {
      setPlanForm({
        plan_name: "",
        description: "",
        price: "",
        duration_days: "30",
        pickup_frequency: "",
        max_weight: "",
      });
    }

    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        planModalMode === "add"
          ? "/api/admin/subscription-plan/add"
          : "/api/admin/subscription-plan/update";

      const payload = {
        plan_name: planForm.plan_name,
        description: planForm.description || null,
        price: parseFloat(planForm.price),
        duration_days: parseInt(planForm.duration_days),
        pickup_frequency: planForm.pickup_frequency || null,
        max_weight: planForm.max_weight ? parseFloat(planForm.max_weight) : null,
        ...(planModalMode === "edit" && { id: selectedPlan?.id }),
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
          `Subscription plan ${planModalMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsPlanModalOpen(false);
        fetchSubscriptionPlans();
      } else {
        showToast("error", result.error || result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      showToast("error", "Error saving subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDeletePlan = (id: number) => {
    setPlanDeleteTarget(id);
    setIsPlanDeleteModalOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planDeleteTarget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/subscription-plan/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planDeleteTarget }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Subscription plan deleted successfully!");
        setIsPlanDeleteModalOpen(false);
        fetchSubscriptionPlans();
      } else {
        showToast("error", result.error || result.detail || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      showToast("error", "Error deleting subscription plan");
    } finally {
      setIsSubmitting(false);
      setPlanDeleteTarget(null);
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
  // PENDING PAYMENT ACTIONS
  // =========================================
  const handleViewPayment = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setIsViewPaymentModalOpen(true);
  };

  const handleOpenVerifyModal = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setReferenceNumber("");
    setReferenceError("");
    setIsVerifyModalOpen(true);
  };

  const validateReferenceNumber = (value: string): boolean => {
    if (!value) {
      setReferenceError("Reference number is required");
      return false;
    }

    const refPattern = /^[A-Za-z0-9\-_\/]{5,25}$/;
    if (!refPattern.test(value)) {
      setReferenceError("Must be 5-25 characters (letters, numbers, dashes, underscores, slashes only)");
      return false;
    }

    setReferenceError("");
    return true;
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateReferenceNumber(referenceNumber)) {
      return;
    }

    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          reference_number: referenceNumber,
        }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Payment verified! Subscription activated.");
        setIsVerifyModalOpen(false);
        fetchPendingPayments();
      } else {
        showToast("error", result.error || result.detail || "Verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      showToast("error", "Error verifying payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // COLUMNS
  // =========================================
  const columnsSubscriptionPlans = useMemo<ColumnDef<SubscriptionPlan>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Plan Name",
        accessorKey: "plan_name",
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
      {
        header: "Duration",
        accessorKey: "duration_days",
        cell: ({ getValue }) => {
          const days = getValue() as number;
          return `${days} days`;
        },
      },
      {
        header: "Pickup Frequency",
        accessorKey: "pickup_frequency",
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
          return value !== null ? value : "Unlimited";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleActionPlan("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleActionPlan("edit", row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => triggerDeletePlan(row.original.id)}
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

  const columnsPendingPayments = useMemo<ColumnDef<PendingPayment>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Transaction Code",
        accessorKey: "transaction_code",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              {value}
            </span>
          );
        },
      },
      {
        header: "Customer",
        accessorFn: (row) => {
          return `${row.first_name} ${row.last_name || ""}`.trim();
        },
      },
      {
        header: "Plan",
        accessorKey: "plan_name",
      },
      {
        header: "Amount",
        accessorKey: "total_payment",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
      {
        header: "Payment Date",
        accessorKey: "payment_time",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return new Date(value).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleViewPayment(row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
              title="View Details"
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleOpenVerifyModal(row.original)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
              title="Verify Payment"
              style={{ backgroundColor: "#d4edda" }}
            >
              <FaCheckCircle />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchTiers();
    fetchPendingPayments();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Others Management</h1>
        <i className={styles.pageSubtitle}>
          Manage subscription plans, pending payments, and customer tiers.
        </i>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "subscriptions" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("subscriptions")}
        >
          Subscription Plans
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "pendingPayments" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("pendingPayments")}
        >
          Pending Payments
          {pendingPayments.length > 0 && (
            <span
              style={{
                marginLeft: "8px",
                backgroundColor: "#dc2626",
                color: "white",
                borderRadius: "9999px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              {pendingPayments.length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "tiers" ? styles.activeTab : ""
            }`}
          onClick={() => setActiveTab("tiers")}
        >
          Customer Tiers
        </button>
      </div>

      {activeTab === "subscriptions" ? (
        <AdminTable
          columns={columnsSubscriptionPlans}
          data={subscriptionPlans}
          isLoading={isLoading}
          onAdd={() => handleActionPlan("add")}
        />
      ) : activeTab === "pendingPayments" ? (
        <AdminTable
          columns={columnsPendingPayments}
          data={pendingPayments}
          isLoading={isLoading}
        />
      ) : (
        <AdminTable
          columns={columnsTiers}
          data={tiers}
          isLoading={isLoading}
          onAdd={() => handleAction("add")}
        />
      )}

      {/* Subscription Plan Form Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={`${planModalMode === "add" ? "Add" : planModalMode === "edit" ? "Edit" : "Detail"
          } Subscription Plan`}
      >
        <form className={styles.singleLayout} onSubmit={handleSavePlan}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Plan Name *</label>
            <input
              className={styles.formInput}
              value={planForm.plan_name}
              onChange={(e) =>
                setPlanForm({ ...planForm, plan_name: e.target.value })
              }
              disabled={planModalMode === "view"}
              required
              placeholder="e.g., Individual, Business"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Price (IDR) *</label>
              <input
                type="number"
                className={styles.formInput}
                value={planForm.price}
                onChange={(e) =>
                  setPlanForm({ ...planForm, price: e.target.value })
                }
                disabled={planModalMode === "view"}
                required
                placeholder="e.g., 75000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Duration (days) *</label>
              <input
                type="number"
                className={styles.formInput}
                value={planForm.duration_days}
                onChange={(e) =>
                  setPlanForm({ ...planForm, duration_days: e.target.value })
                }
                disabled={planModalMode === "view"}
                required
                placeholder="e.g., 30"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Pickup Frequency</label>
              <select
                className={styles.formSelect}
                value={planForm.pickup_frequency}
                onChange={(e) =>
                  setPlanForm({ ...planForm, pickup_frequency: e.target.value })
                }
                disabled={planModalMode === "view"}
              >
                <option value="">Select frequency</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Max Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={planForm.max_weight}
                onChange={(e) =>
                  setPlanForm({ ...planForm, max_weight: e.target.value })
                }
                disabled={planModalMode === "view"}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              className={styles.formTextarea}
              value={planForm.description}
              onChange={(e) =>
                setPlanForm({ ...planForm, description: e.target.value })
              }
              disabled={planModalMode === "view"}
              rows={3}
              placeholder="Deskripsi paket berlangganan..."
            />
          </div>

          <div className={styles.modalFooter}>
            {planModalMode === "view" ? (
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
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

      {/* Delete Subscription Plan Modal */}
      <Modal
        isOpen={isPlanDeleteModalOpen}
        onClose={() => !isSubmitting && setIsPlanDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className={styles.singleLayout}>
          <div>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Are you sure you want to delete this subscription plan?
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
              onClick={() => setIsPlanDeleteModalOpen(false)}
              className={`${styles.btnBase} ${styles.btnCancel}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletePlan}
              className={`${styles.btnBase} ${styles.btnDeleteConfirm}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </Modal>

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

      {/* View Payment Modal */}
      <Modal
        isOpen={isViewPaymentModalOpen}
        onClose={() => setIsViewPaymentModalOpen(false)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className={styles.singleLayout}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Transaction Code</label>
              <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
                {selectedPayment.transaction_code}
              </p>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Customer</label>
                <p>
                  {selectedPayment.first_name} {selectedPayment.last_name || ""}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <p>{selectedPayment.email}</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Plan</label>
                <p>{selectedPayment.plan_name}</p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Duration</label>
                <p>{selectedPayment.duration_days} days</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount</label>
                <p style={{ fontWeight: "600", color: "#2f5e44" }}>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(selectedPayment.total_payment)}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Payment Method</label>
                <p>{selectedPayment.payment_method || "-"}</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Proof</label>
              {selectedPayment.payment_proof_url ? (
                <img
                  src={selectedPayment.payment_proof_url}
                  alt="Payment proof"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
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
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  No payment proof uploaded
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsViewPaymentModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsViewPaymentModalOpen(false);
                  handleOpenVerifyModal(selectedPayment);
                }}
                className={`${styles.btnBase} ${styles.btnSave}`}
              >
                Verify Payment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Payment Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => !isSubmitting && setIsVerifyModalOpen(false)}
        title="Verify Payment"
      >
        {selectedPayment && (
          <form className={styles.singleLayout} onSubmit={handleVerifyPayment}>
            <div
              style={{
                backgroundColor: "#f0fdf4",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
              }}
            >
              <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                Payment Summary
              </p>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                <strong>Customer:</strong> {selectedPayment.first_name}{" "}
                {selectedPayment.last_name || ""}
              </p>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                <strong>Plan:</strong> {selectedPayment.plan_name} (
                {selectedPayment.duration_days} days)
              </p>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                <strong>Amount:</strong>{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(selectedPayment.total_payment)}
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reference Number *</label>
              <input
                className={styles.formInput}
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value.toUpperCase());
                  if (referenceError) validateReferenceNumber(e.target.value.toUpperCase());
                }}
                onBlur={() => validateReferenceNumber(referenceNumber)}
                placeholder="e.g., TRF-123456789"
                style={{
                  borderColor: referenceError ? "#ED1C24" : undefined,
                }}
              />
              {referenceError && (
                <small style={{ color: "#ED1C24", fontSize: "0.75rem" }}>
                  {referenceError}
                </small>
              )}
              <small style={{ color: "#666", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                Enter bank transfer reference (5-25 characters)
              </small>
            </div>

            <div
              style={{
                backgroundColor: "#fef3c7",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #fcd34d",
              }}
            >
              <p style={{ fontSize: "0.9rem", color: "#92400e" }}>
                ⚠️ Pastikan pembayaran sudah diterima dan valid sebelum
                memverifikasi. Setelah diverifikasi, subscription akan langsung
                aktif.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className={`${styles.btnBase} ${styles.btnCancel}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btnBase} ${styles.btnSave}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
