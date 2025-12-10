"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";
import { useSession } from "next-auth/react";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "./admins.module.css";

type Admin = {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  role_name: string;
  created_at?: string;
  updated_at?: string;
};

type ModalMode = "view" | "add" | "edit";

export default function AdminsPage() {
  const { data: session } = useSession();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Form state
  const [adminForm, setAdminForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/admin");
      const result = await response.json();

      if (result.message === "SUCCESS") {
        setAdmins(result.data || []);
      } else {
        showToast("error", "Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      showToast("error", "Error fetching admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (mode: ModalMode, admin?: Admin) => {
    setModalMode(mode);
    setSelectedAdmin(admin || null);

    if (admin && (mode === "view" || mode === "edit")) {
      setAdminForm({
        first_name: admin.first_name,
        last_name: admin.last_name || "",
        email: admin.email,
        phone_number: admin.phone_number || "",
        address: admin.address || "",
      });
    } else {
      setAdminForm({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        address: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let url: string;
      let payload: any;

      if (modalMode === "add") {
        url = "/api/admin/admin/add";
        payload = {
          email: adminForm.email,
        };
      } else {
        // edit mode
        url = "/api/admin/admin/update";
        payload = {
          id: selectedAdmin?.id,
          first_name: adminForm.first_name,
          last_name: adminForm.last_name || null,
          phone_number: adminForm.phone_number || null,
          address: adminForm.address || null,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          modalMode === "add"
            ? "Admin added successfully!"
            : "Profile updated successfully!"
        );
        setIsModalOpen(false);
        fetchAdmins();
      } else {
        showToast("error", result.error || result.detail || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving admin:", error);
      showToast("error", "Error saving admin");
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
      const response = await fetch("/api/admin/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Admin deleted successfully!");
        setIsDeleteModalOpen(false);
        fetchAdmins();
      } else {
        showToast("error", result.error || result.detail || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      showToast("error", "Error deleting admin");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<Admin>[]>(
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
        header: "Phone Number",
        accessorKey: "phone_number",
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      {
        header: "Role",
        accessorKey: "role_name",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isCurrentUser =
            session?.user?.id?.toString() === row.original.id.toString();

          return (
            <div className={styles.actionRow}>
              <button
                onClick={() => handleAction("view", row.original)}
                className={`${styles.btnAction} ${styles.btnView}`}
              >
                <FaEye />
              </button>
              {isCurrentUser && (
                <button
                  onClick={() => handleAction("edit", row.original)}
                  className={`${styles.btnAction} ${styles.btnEdit}`}
                >
                  <FaEdit />
                </button>
              )}
              <button
                onClick={() => triggerDelete(row.original.id)}
                className={`${styles.btnAction} ${styles.btnDelete}`}
              >
                <FaTrash />
              </button>
            </div>
          );
        },
      },
    ],
    [session]
  );

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Admin Management</h1>
        <i className={styles.pageSubtitle}>
          Manage system administrators. Admins can add and delete other admins,
          but cannot edit other admin's data.
        </i>
      </div>

      <AdminTable
        columns={columns}
        data={admins}
        isLoading={isLoading}
        onAdd={() => handleAction("add")}
      />

      {/* Admin Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${
          modalMode === "add" ? "Add" : modalMode === "edit" ? "Edit" : "Detail"
        } Admin`}
      >
        <form className={styles.singleLayout} onSubmit={handleSave}>
          {modalMode === "add" ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  required
                  placeholder="e.g., admin@example.com"
                />
                <small style={{ color: "#666", fontSize: "0.85rem" }}>
                  Enter the email of an existing registered user to promote them
                  to admin
                </small>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name *</label>
                  <input
                    className={styles.formInput}
                    value={adminForm.first_name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, first_name: e.target.value })
                    }
                    disabled={modalMode === "view"}
                    required={modalMode === "edit"}
                    placeholder="e.g., John"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name</label>
                  <input
                    className={styles.formInput}
                    value={adminForm.last_name}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, last_name: e.target.value })
                    }
                    disabled={modalMode === "view"}
                    placeholder="e.g., Doe"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={adminForm.email}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={adminForm.phone_number}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, phone_number: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  placeholder="e.g., +62 812 3456 7890"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <textarea
                  className={styles.formTextarea}
                  value={adminForm.address}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, address: e.target.value })
                  }
                  disabled={modalMode === "view"}
                  rows={3}
                  placeholder="Enter address..."
                />
              </div>
            </>
          )}

          {modalMode === "view" && selectedAdmin && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <input
                  className={styles.formInput}
                  value={selectedAdmin.role_name}
                  disabled
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Created At</label>
                  <input
                    className={styles.formInput}
                    value={
                      selectedAdmin.created_at
                        ? new Date(selectedAdmin.created_at).toLocaleString()
                        : "-"
                    }
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Updated At</label>
                  <input
                    className={styles.formInput}
                    value={
                      selectedAdmin.updated_at
                        ? new Date(selectedAdmin.updated_at).toLocaleString()
                        : "-"
                    }
                    disabled
                  />
                </div>
              </div>
            </>
          )}

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
                  {isSubmitting
                    ? modalMode === "add"
                      ? "Adding..."
                      : "Saving..."
                    : modalMode === "add"
                    ? "Add Admin"
                    : "Save Changes"}
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
              Are you sure you want to delete this admin?
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              This action cannot be undone. The admin will lose access to the
              system immediately.
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
