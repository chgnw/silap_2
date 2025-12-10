"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "./waste.module.css";

type WasteCategory = {
  id: number;
  waste_category_name: string;
  icon_name: string | null;
  unit: string | null;
  points_per_unit: number;
};

export default function WastePage() {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null);

  const fetchWasteCategories = async () => {
    try {
      const response = await fetch("/api/admin/waste-category/get-waste-cat");
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error("Failed getting waste categories data: ", error);
      showToast("error", "Failed retrieving categories data");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchWasteCategories().finally(() => setIsLoading(false));
  }, []);

  // =========================================
  // LOGIC CATEGORY (CRUD)
  // =========================================
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catMode, setCatMode] = useState<"view" | "edit" | "add">("add");
  const [selectedCat, setSelectedCat] = useState<WasteCategory | null>(null);

  const [catFormName, setCatFormName] = useState("");
  const [catUnit, setCatUnit] = useState("");
  const [catPoints, setCatPoints] = useState("");
  const [catIconFile, setCatIconFile] = useState<File | null>(null);
  const [catIconPreview, setCatIconPreview] = useState<string | null>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCatModalOpen) {
      if (catMode === "add") {
        setCatFormName("");
        setCatUnit("");
        setCatPoints("");
        setCatIconFile(null);
        setCatIconPreview(null);
      } else if (selectedCat) {
        setCatFormName(selectedCat.waste_category_name);
        setCatUnit(selectedCat.unit || "");
        setCatPoints(selectedCat.points_per_unit?.toString() || "");
        setCatIconFile(null);
        setCatIconPreview(selectedCat.icon_name);
      }
    }
  }, [isCatModalOpen, catMode, selectedCat]);

  const handleActionCat = (
    mode: "view" | "edit" | "add",
    data?: WasteCategory
  ) => {
    setCatMode(mode);
    setSelectedCat(data || null);
    setIsCatModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCatIconFile(file);
      setCatIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("waste_category_name", catFormName);
    formData.append("unit", catUnit);
    formData.append("points_per_unit", catPoints);
    if (catIconFile) formData.append("image", catIconFile);

    try {
      let url = "/api/admin/waste-category/add-waste-cat";
      let method = "POST";

      if (catMode === "edit" && selectedCat) {
        url = "/api/admin/waste-category/edit-waste-cat";
        formData.append("id", selectedCat.id.toString());
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        showToast(
          "success",
          `Category ${catMode === "add" ? "Added" : "Updated"} Successfully!`
        );
        setIsCatModalOpen(false);
        fetchWasteCategories();
      } else {
        showToast("failed", `Failed: ${result.detail}`);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("failed", "Error saving catgory data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (id: number) => {
    setDeleteTarget({ id });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "/api/admin/waste-category/delete-waste-cat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteTarget.id }),
        }
      );
      const result = await response.json();

      if (response.ok) {
        showToast("success", "Deleted successfully!");
        setIsDeleteModalOpen(false);
        fetchWasteCategories();
      } else {
        showToast("error", `Failed: ${result.message}`);
      }
    } catch (error) {
      showToast("error", "Error deleting data!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsCategory = useMemo<ColumnDef<WasteCategory>[]>(
    () => [
      {
        header: "No",
        accessorFn: (_, i) => i + 1,
        size: 50,
      },
      {
        header: "Name",
        accessorKey: "waste_category_name",
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        header: "Points per Unit",
        accessorKey: "points_per_unit",
        cell: ({ getValue }) => getValue() || "0",
      },
      {
        header: "Icon",
        accessorKey: "icon_name",
        cell: ({ getValue }) => {
          const path = getValue() as string;
          if (!path) return "-";

          return path.split("/").pop();
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button
              onClick={() => handleActionCat("view", row.original)}
              className={`${styles.btnAction} ${styles.btnView}`}
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleActionCat("edit", row.original)}
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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Master Waste Category Management</h1>
        <i className={styles.pageSubtitle}>
          Manage waste categories with points per unit system.
        </i>
      </div>

      <AdminTable
        columns={columnsCategory}
        data={categories}
        isLoading={isLoading}
        onAdd={() => handleActionCat("add")}
      />

      {/* Modal Waste Category */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={`${
          catMode === "add" ? "Add" : catMode === "edit" ? "Edit" : "Detail"
        } Category`}
      >
        <form className={styles.splitLayout} onSubmit={handleSaveCategory}>
          <div className={styles.imageSection}>
            <label className={styles.formLabel}>Icon</label>

            <div className={styles.imagePreview}>
              {catIconPreview ? (
                <img src={`/upload/${catIconPreview}`} alt="Preview" />
              ) : selectedCat?.icon_name ? (
                <span style={{ fontSize: 30 }}>📦</span>
              ) : (
                <span className={styles.placeholderText}>No Icon</span>
              )}
            </div>

            {catMode !== "view" && (
              <>
                <input
                  type="file"
                  ref={catFileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  className={`${styles.btnBase} ${styles.uploadBtn}`}
                  onClick={() => catFileInputRef.current?.click()}
                >
                  Upload Icon
                </button>
              </>
            )}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category Name</label>
              <input
                className={styles.formInput}
                value={catFormName}
                onChange={(e) => setCatFormName(e.target.value)}
                disabled={catMode === "view"}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unit</label>
                <input
                  className={styles.formInput}
                  value={catUnit}
                  onChange={(e) => setCatUnit(e.target.value)}
                  disabled={catMode === "view"}
                  placeholder="kg / pcs"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Points per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  className={styles.formInput}
                  value={catPoints}
                  onChange={(e) => setCatPoints(e.target.value)}
                  disabled={catMode === "view"}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              {catMode === "view" ? (
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className={`${styles.btnBase} ${styles.btnCancel}`}
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
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
              Are you sure you want to delete this category?
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
