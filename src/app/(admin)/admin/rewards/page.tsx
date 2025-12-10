"use client";

import React, { useState, useEffect, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import { showToast } from "@/lib/toastHelper";
import AdminTable from "../../../components/Large/DataTable/DataTable";
import Modal from "../../../components/Large/Modal/Modal";
import styles from "./rewards.module.css";

interface RewardCategory {
  id: number;
  category_name: string;
  created_at?: string;
  updated_at?: string;
}

interface Reward {
  id: number;
  category_id: number;
  reward_name: string;
  vendor_name: string;
  image_path: string;
  point_required: number;
  total_redeemed: number;
  stock: number;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
}

type ModalMode = "add" | "edit" | "view";
type ActiveTab = "category" | "reward";

export default function RewardsManagementPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("category");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reward Categories State
  const [categories, setCategories] = useState<RewardCategory[]>([]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catMode, setCatMode] = useState<ModalMode>("add");
  const [selectedCat, setSelectedCat] = useState<RewardCategory | null>(null);
  const [catFormName, setCatFormName] = useState("");

  // Reward Items State
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardMode, setRewardMode] = useState<ModalMode>("add");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    reward_name: "",
    vendor_name: "",
    category_id: "",
    point_required: "",
    stock: "",
  });
  const [rewardImagePreview, setRewardImagePreview] = useState<string>("");
  const [rewardImageFile, setRewardImageFile] = useState<File | null>(null);
  const rewardFileInputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "reward";
    id: number;
  } | null>(null);

  /*
    Fetch initial data
  */
  useEffect(() => {
    fetchCategories();
    fetchRewards();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reward-category");
      const result = await response.json();

      setCategories(result.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("error", "Failed fetching reward categories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reward-item");
      const result = await response.json();

      setRewards(result.data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      showToast("error", "Failed fetching reward items");
    } finally {
      setIsLoading(false);
    }
  };

  /*
    File Input Handler
  */
  const handleRewardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRewardImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRewardImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================
  // REWARD CATEGORIES LOGIC
  // ============================
  const handleActionCat = (mode: ModalMode, cat?: RewardCategory) => {
    setCatMode(mode);
    setSelectedCat(cat || null);
    setCatFormName(cat?.category_name || "");
    setIsCatModalOpen(true);
  };

  /*
    Save & Edit Handler
  */
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        catMode === "add"
          ? "/api/admin/reward-category/add"
          : "/api/admin/reward-category/update";
      const method = "POST";

      const payload = {
        category_name: catFormName,
        ...(catMode === "edit" && { category_id: selectedCat?.id }),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `Category ${catMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsCatModalOpen(false);
        fetchCategories();
        resetCategoryForm();
      } else {
        showToast("failed", `Failed: ${result.detail}`);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("failed", "Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
    Reset Reward Category Form
  */
  const resetCategoryForm = () => {
    setCatFormName("");
    setSelectedCat(null);
  };

  // ============================
  // REWARD ITEMS LOGIC
  // ============================
  const handleActionReward = (mode: ModalMode, reward?: Reward) => {
    setRewardMode(mode);
    setSelectedReward(reward || null);

    if (reward) {
      setRewardForm({
        reward_name: reward.reward_name,
        vendor_name: reward.vendor_name,
        category_id: reward.category_id.toString(),
        point_required: reward.point_required.toString(),
        stock: reward.stock.toString(),
      });
      setRewardImagePreview(
        reward.image_path && reward.image_path.trim() !== ""
          ? `/upload/${reward.image_path}`
          : "/images/dummy.png"
      );
    } else {
      resetRewardForm();
    }

    setIsRewardModalOpen(true);
  };

  /*
    Save & Edit Handler
  */
  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("reward_name", rewardForm.reward_name);
    formData.append("vendor_name", rewardForm.vendor_name);
    formData.append("category_id", rewardForm.category_id);
    formData.append("point_required", rewardForm.point_required);
    formData.append("stock", rewardForm.stock);

    if (rewardImageFile) {
      formData.append("image", rewardImageFile);
    }

    try {
      const url =
        rewardMode === "add"
          ? "/api/admin/reward-item/add"
          : "/api/admin/reward-item/update";

      if (rewardMode === "edit" && selectedReward) {
        formData.append("id", selectedReward.id.toString());
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `Reward ${rewardMode === "add" ? "added" : "updated"} successfully!`
        );
        setIsRewardModalOpen(false);
        fetchRewards();
        resetRewardForm();
      } else {
        showToast("failed", `Failed: ${result.detail}`);
      }
    } catch (error) {
      console.error("Error saving reward:", error);
      showToast("failed", "An error occurred while saving reward");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
    Reset Reward Item Form
  */
  const resetRewardForm = () => {
    setRewardForm({
      reward_name: "",
      vendor_name: "",
      category_id: "",
      point_required: "",
      stock: "",
    });
    setRewardImagePreview("");
    setRewardImageFile(null);
    setSelectedReward(null);
  };

  /*
    DELETE HANDLER (untuk reward category dan reward item)
  */
  const handleDelete = (type: "category" | "reward", id: number) => {
    setDeleteTarget({ type, id });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      const url =
        deleteTarget.type === "category"
          ? `/api/admin/reward-category/delete`
          : `/api/admin/reward-item/delete`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deleteTarget.id,
        }),
      });
      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast(
          "success",
          `${
            deleteTarget.type === "category" ? "Category" : "Reward"
          } berhasil di hapus!`
        );
        setIsDeleteModalOpen(false);
        deleteTarget.type === "category" ? fetchCategories() : fetchRewards();
      } else {
        showToast(
          "failed",
          `Gagal menghapus ${
            deleteTarget.type === "category" ? "Category" : "Reward"
          }!`
        );
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("failed", "Terjadi kesalahan pada server");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const columnsCategory: ColumnDef<RewardCategory>[] = [
    {
      header: "No",
      accessorFn: (_, i) => i + 1,
      size: 50,
    },
    {
      accessorKey: "category_name",
      header: "Category Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleActionCat("view", row.original)}
            className={styles.btnView}
            title="View"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleActionCat("edit", row.original)}
            className={styles.btnEdit}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete("category", row.original.id)}
            className={styles.btnDelete}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const columnsReward: ColumnDef<Reward>[] = [
    {
      header: "No",
      accessorFn: (_, i) => i + 1,
      size: 50,
    },
    {
      accessorKey: "image_path",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={
            row.original.image_path
              ? `/upload/${row.original.image_path}`
              : "/images/dummy.png"
          }
          alt={row.original.reward_name}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      accessorKey: "reward_name",
      header: "Reward Name",
    },
    {
      accessorKey: "vendor_name",
      header: "Vendor",
    },
    {
      accessorKey: "category_name",
      header: "Category",
    },
    {
      accessorKey: "point_required",
      header: "Points",
      cell: ({ row }) => row.original.point_required.toLocaleString(),
    },
    {
      accessorKey: "stock",
      header: "Stock",
    },
    {
      accessorKey: "total_redeemed",
      header: "Redeemed",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleActionReward("view", row.original)}
            className={styles.btnView}
            title="View"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleActionReward("edit", row.original)}
            className={styles.btnEdit}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete("reward", row.original.id)}
            className={styles.btnDelete}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Master Rewards Management</h1>
        <i className={styles.pageSubtitle}>
          Manage reward categories and redemption items with points and stock.
        </i>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "category" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("category")}
        >
          Reward Categories
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "reward" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("reward")}
        >
          Rewards
        </button>
      </div>

      {activeTab === "category" ? (
        <AdminTable
          columns={columnsCategory}
          data={categories}
          isLoading={isLoading}
          onAdd={() => handleActionCat("add")}
        />
      ) : (
        <AdminTable
          columns={columnsReward}
          data={rewards}
          isLoading={isLoading}
          onAdd={() => handleActionReward("add")}
        />
      )}

      {/* Modal Reward Category */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={`${
          catMode === "add" ? "Add" : catMode === "edit" ? "Edit" : "Detail"
        } Reward Category`}
      >
        <form className={styles.singleLayout} onSubmit={handleSaveCategory}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category Name</label>
            <input
              className={styles.formInput}
              value={catFormName}
              onChange={(e) => setCatFormName(e.target.value)}
              disabled={catMode === "view"}
              required
              placeholder="Enter category name (e.g., Electronics, Vouchers)"
            />
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
        </form>
      </Modal>

      {/* Modal Reward Item */}
      <Modal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        title={`${
          rewardMode === "add"
            ? "Add"
            : rewardMode === "edit"
            ? "Edit"
            : "Detail"
        } Reward`}
      >
        <form className={styles.splitLayout} onSubmit={handleSaveReward}>
          <div className={styles.imageSection}>
            <label className={styles.formLabel}>Reward Image</label>
            <div className={styles.imagePreview}>
              {rewardImagePreview ? (
                <img src={`${rewardImagePreview}`} alt="Preview" />
              ) : (
                <span className={styles.placeholderText}>No Image</span>
              )}
            </div>

            {rewardMode !== "view" && (
              <>
                <input
                  type="file"
                  ref={rewardFileInputRef}
                  onChange={handleRewardFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className={`${styles.btnBase} ${styles.uploadBtn}`}
                  onClick={() => rewardFileInputRef.current?.click()}
                >
                  Upload Image
                </button>
              </>
            )}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reward Name</label>
              <input
                className={styles.formInput}
                value={rewardForm.reward_name}
                onChange={(e) =>
                  setRewardForm({ ...rewardForm, reward_name: e.target.value })
                }
                disabled={rewardMode === "view"}
                placeholder="e.g., iPhone 15 Pro"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vendor Name</label>
              <input
                className={styles.formInput}
                value={rewardForm.vendor_name}
                onChange={(e) =>
                  setRewardForm({ ...rewardForm, vendor_name: e.target.value })
                }
                disabled={rewardMode === "view"}
                placeholder="e.g., Apple Store, Tokopedia"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select
                className={styles.formSelect}
                value={rewardForm.category_id}
                onChange={(e) =>
                  setRewardForm({ ...rewardForm, category_id: e.target.value })
                }
                disabled={rewardMode === "view"}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Points Required</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={rewardForm.point_required}
                  onChange={(e) =>
                    setRewardForm({
                      ...rewardForm,
                      point_required: e.target.value,
                    })
                  }
                  disabled={rewardMode === "view"}
                  placeholder="e.g., 5000"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Stock</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={rewardForm.stock}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, stock: e.target.value })
                  }
                  disabled={rewardMode === "view"}
                  placeholder="e.g., 50"
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              {rewardMode === "view" ? (
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className={`${styles.btnBase} ${styles.btnCancel}`}
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRewardModalOpen(false)}
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
