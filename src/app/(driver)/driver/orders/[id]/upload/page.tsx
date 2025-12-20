"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import styles from "./upload.module.css";
import { showToast } from "@/lib/toastHelper";
import { FaArrowLeft, FaSave, FaTrash } from "react-icons/fa";

interface WasteCategory {
  id: number;
  name: string;
  icon: string;
  unit: string;
  points_per_unit: number;
}

interface SelectedCategory extends WasteCategory {
  selectedAt: number;
  weight: number;
  isExpanded?: boolean;
}

export default function UploadOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategory[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSorted, setIsSorted] = useState(true);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [tempWeight, setTempWeight] = useState<{ [key: number]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/waste");
      const data = await res.json();

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        showToast("error", "Gagal memuat kategori sampah");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category: WasteCategory) => {
    const selectedCategory: SelectedCategory = {
      ...category,
      selectedAt: Date.now(),
      weight: 0,
      isExpanded: false,
    };
    setSelectedCategories([...selectedCategories, selectedCategory]);
    setShowDropdown(false);
  };

  const toggleExpanded = (categoryId: number) => {
    const category = selectedCategories.find((cat) => cat.id === categoryId);
    if (category && !category.isExpanded) {
      setTempWeight({ ...tempWeight, [categoryId]: category.weight || 0 });
    }
    setSelectedCategories(
      selectedCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  const handleSaveWeight = (categoryId: number) => {
    const weight = tempWeight[categoryId] || 0;
    setSelectedCategories(
      selectedCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, weight, isExpanded: false } : cat
      )
    );
    showToast("success", "Berat berhasil disimpan");
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCategories(
      selectedCategories.filter((cat) => cat.id !== categoryId)
    );
  };

  const availableCategories = categories.filter(
    (category) =>
      !selectedCategories.some((selected) => selected.id === category.id)
  );

  // Calculate total weight
  const calculatedTotalWeight = isSorted
    ? selectedCategories.reduce((sum, cat) => sum + (cat.weight || 0), 0)
    : totalWeight;

  const handleSubmitPickup = async () => {
    // Validation
    if (!isSorted && totalWeight <= 0) {
      showToast("error", "Masukkan berat total sampah");
      return;
    }

    if (isSorted && selectedCategories.length === 0) {
      showToast("error", "Pilih minimal 1 kategori sampah");
      return;
    }

    if (isSorted && calculatedTotalWeight <= 0) {
      showToast("error", "Masukkan berat untuk setiap kategori");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        pickup_event_id: parseInt(eventId),
        is_sorted: isSorted,
        total_weight: calculatedTotalWeight,
        categories: isSorted
          ? selectedCategories.map((cat) => ({
              category_id: cat.id,
              weight: cat.weight,
            }))
          : [],
      };

      const res = await fetch("/api/driver/pickup/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Pickup berhasil disubmit!");
        router.push("/driver/orders");
      } else {
        showToast("error", data.detail || "Gagal submit pickup");
      }
    } catch (error) {
      console.error("Error submitting pickup:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FaArrowLeft />
        </button>
        <h1 className={styles.title}>Upload Order</h1>
      </div>

      {/* Category Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Kategori Sampah</h2>
      </div>

      {/* Toggle Section */}
      <div className={styles.toggleSection}>
        <p className={styles.toggleLabel}>Apakah sampah dipilah customer?</p>
        <button
          className={styles.toggleSwitch}
          onClick={() => {
            if (isSorted) {
              setIsSorted(false);
              setSelectedCategories([]);
            } else {
              setIsSorted(true);
              setTotalWeight(0);
            }
          }}
          role="switch"
          aria-checked={isSorted}
        >
          <span
            className={`${styles.toggleSlider} ${
              isSorted ? styles.toggleSliderActive : ""
            }`}
          />
        </button>
      </div>

      {/* Sorted Waste - Category Selection */}
      {isSorted && (
        <>
          {/* Dropdown Section */}
          <div className={styles.dropdownSection}>
            <button
              className={styles.dropdownButton}
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={availableCategories.length === 0}
            >
              <span className={styles.dropdownIcon}>📦</span>
              <span>
                {availableCategories.length === 0
                  ? "Semua kategori telah dipilih"
                  : "Kategori sampah"}
              </span>
              {availableCategories.length > 0 && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ marginLeft: "auto" }}
                  className={
                    showDropdown ? styles.chevronUp : styles.chevronDown
                  }
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              )}
            </button>

            {showDropdown && availableCategories.length > 0 && (
              <div className={styles.dropdown}>
                <div className={styles.categoryList}>
                  {availableCategories.map((category) => (
                    <div
                      key={category.id}
                      className={styles.categoryItem}
                      onClick={() => handleSelectCategory(category)}
                    >
                      <div className={styles.categoryIcon}>
                        {category.icon ? (
                          <Image
                            src={`/upload${category.icon}`}
                            alt={category.name}
                            width={40}
                            height={40}
                            className={styles.iconImage}
                          />
                        ) : (
                          <span className={styles.iconPlaceholder}>📦</span>
                        )}
                      </div>
                      <span className={styles.categoryName}>
                        {category.name}
                      </span>
                      <span className={styles.categoryArrow}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Categories Cards */}
          <div className={styles.selectedCategoriesContainer}>
            {selectedCategories.map((category) => (
              <div key={category.id} className={styles.selectedCategoryCard}>
                <div
                  className={styles.selectedCategoryHeader}
                  onClick={() => toggleExpanded(category.id)}
                >
                  <div className={styles.selectedCategoryIcon}>
                    {category.icon ? (
                      <Image
                        src={`/upload${category.icon}`}
                        alt={category.name}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className={styles.selectedCategoryInfo}>
                    <span className={styles.selectedCategoryName}>
                      {category.name}
                    </span>
                    <span className={styles.selectedCategoryWeight}>
                      {category.weight > 0 ? `${category.weight}Kg` : "0Kg"}
                    </span>
                  </div>
                  <button className={styles.expandButton}>›</button>
                </div>

                {category.isExpanded && (
                  <div className={styles.expandedSection}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={tempWeight[category.id] || ""}
                      onChange={(e) =>
                        setTempWeight({
                          ...tempWeight,
                          [category.id]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={styles.weightInput}
                      placeholder="Masukkan berat (kg)..."
                    />
                    <div className={styles.expandedButtons}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveWeight(category.id)}
                      >
                        <FaSave /> Simpan
                      </button>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveCategory(category.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Unsorted Waste - Total Weight Input */}
      {!isSorted && (
        <div className={styles.totalWeightSection}>
          <div className={styles.totalWeightCard}>
            <span className={styles.totalWeightIcon}>⚖️</span>
            <div className={styles.totalWeightInfo}>
              <span className={styles.totalWeightLabel}>Total sampah</span>
              <div className={styles.totalWeightInputWrapper}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={totalWeight || ""}
                  onChange={(e) =>
                    setTotalWeight(parseFloat(e.target.value) || 0)
                  }
                  className={styles.totalWeightInput}
                  placeholder="10"
                />
                <span className={styles.totalWeightUnit}>Kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        className={styles.submitButton}
        onClick={handleSubmitPickup}
        disabled={submitting || calculatedTotalWeight <= 0}
      >
        {submitting ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </div>
  );
}
