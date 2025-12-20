"use client";

import React, { useState, useEffect } from "react";
import styles from "./WasteType.module.css";
import WasteTypeCard from "../../Medium/WasteTypeCard/WasteTypeCard";

interface WasteCategory {
  id: number;
  name: string;
  icon: string;
  unit: string;
  point_per_unit: number;
}

export default function WasteTypeSection() {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/waste")
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching waste data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h1>Jenis Sampah</h1>
        <p>
          Lihat semua jenis sampah yang kami daur ulang dan nilai poin per unit
        </p>
      </div>

      <div className={styles.categoryGrid}>
        {loading ? (
          <div className={styles.loadingState}>
            <p>Memuat kategori sampah...</p>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <WasteTypeCard key={category.id} category={category} />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Tidak ada kategori sampah tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}
