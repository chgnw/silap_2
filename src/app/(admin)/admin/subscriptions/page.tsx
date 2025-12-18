"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "../subscriptions/subscriptions.module.css";

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

type PaymentHistory = {
    id: number;
    transaction_code: string;
    user_id: number;
    subscription_plan_id: number;
    payment_type: string;
    payment_method: string | null;
    reference_number: string | null;
    total_payment: number;
    payment_time: string;
    verified_at: string;
    created_at: string;
    first_name: string;
    last_name: string | null;
    email: string;
    phone_number: string | null;
    plan_name: string;
    price: number;
    duration_days: number;
    pickup_frequency: string | null;
    verified_by_name: string | null;
};

type ModalMode = "view" | "edit" | "add";
type ActiveTab = "pendingPayments" | "paymentHistory" | "subscriptionPlans";

export default function SubscriptionsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("pendingPayments");
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
    // PENDING PAYMENTS SECTION
    // =========================================
    const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
    const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [referenceError, setReferenceError] = useState("");

    // =========================================
    // PAYMENT HISTORY SECTION
    // =========================================
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [isViewHistoryModalOpen, setIsViewHistoryModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<PaymentHistory | null>(null);

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

    const fetchPaymentHistory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/subscription/history");
            const result = await response.json();

            if (result.message === "SUCCESS") {
                setPaymentHistory(result.data || []);
            } else {
                showToast("error", "Failed to fetch payment history");
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
            showToast("error", "Error fetching payment history");
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
                fetchPaymentHistory();
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
    // PAYMENT HISTORY ACTIONS
    // =========================================
    const handleViewHistory = (history: PaymentHistory) => {
        setSelectedHistory(history);
        setIsViewHistoryModalOpen(true);
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

    const columnsPaymentHistory = useMemo<ColumnDef<PaymentHistory>[]>(
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
                header: "Reference Number",
                accessorKey: "reference_number",
                cell: ({ getValue }) => {
                    const value = getValue() as string | null;
                    return value ? (
                        <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#2f5e44", fontWeight: "600" }}>
                            {value}
                        </span>
                    ) : "-";
                },
            },
            {
                header: "Verified Date",
                accessorKey: "verified_at",
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
                            onClick={() => handleViewHistory(row.original)}
                            className={`${styles.btnAction} ${styles.btnView}`}
                            title="View Details"
                        >
                            <FaEye />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    useEffect(() => {
        fetchSubscriptionPlans();
        fetchPendingPayments();
        fetchPaymentHistory();
    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Subscriptions Management</h1>
                <i className={styles.pageSubtitle}>
                    Manage subscription plans, pending payments, and payment history.
                </i>
            </div>

            <div className={styles.tabsContainer}>
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
                    className={`${styles.tabButton} ${activeTab === "paymentHistory" ? styles.activeTab : ""
                        }`}
                    onClick={() => setActiveTab("paymentHistory")}
                >
                    Payment History
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "subscriptionPlans" ? styles.activeTab : ""
                        }`}
                    onClick={() => setActiveTab("subscriptionPlans")}
                >
                    Subscription Plans
                </button>
            </div>

            {activeTab === "pendingPayments" ? (
                <AdminTable
                    columns={columnsPendingPayments}
                    data={pendingPayments}
                    isLoading={isLoading}
                />
            ) : activeTab === "paymentHistory" ? (
                <AdminTable
                    columns={columnsPaymentHistory}
                    data={paymentHistory}
                    isLoading={isLoading}
                />
            ) : (
                <AdminTable
                    columns={columnsSubscriptionPlans}
                    data={subscriptionPlans}
                    isLoading={isLoading}
                    onAdd={() => handleActionPlan("add")}
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

            {/* View Payment History Modal */}
            <Modal
                isOpen={isViewHistoryModalOpen}
                onClose={() => setIsViewHistoryModalOpen(false)}
                title="Payment History Details"
            >
                {selectedHistory && (
                    <div className={styles.singleLayout}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Transaction Code</label>
                            <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
                                {selectedHistory.transaction_code}
                            </p>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Customer</label>
                                <p>
                                    {selectedHistory.first_name} {selectedHistory.last_name || ""}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <p>{selectedHistory.email}</p>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Plan</label>
                                <p>{selectedHistory.plan_name}</p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Duration</label>
                                <p>{selectedHistory.duration_days} days</p>
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
                                    }).format(selectedHistory.total_payment)}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Payment Method</label>
                                <p>{selectedHistory.payment_method || "-"}</p>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Reference Number</label>
                                <p style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#2f5e44", fontWeight: "600" }}>
                                    {selectedHistory.reference_number || "-"}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Verified By</label>
                                <p>{selectedHistory.verified_by_name || "-"}</p>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Payment Time</label>
                                <p>
                                    {new Date(selectedHistory.payment_time).toLocaleString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Verified At</label>
                                <p>
                                    {new Date(selectedHistory.verified_at).toLocaleString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                onClick={() => setIsViewHistoryModalOpen(false)}
                                className={`${styles.btnBase} ${styles.btnCancel}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
