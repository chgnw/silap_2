import React from "react";
import styles from "./WasteTypeCard.module.css";

interface WasteCategory {
  id: number;
  name: string;
  icon: string;
  unit: string;
  points_per_unit: number;
}

interface WasteTypeCardProps {
  category: WasteCategory;
}

const WasteTypeCard = ({ category }: WasteTypeCardProps) => {
  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryIconWrapper}>
        <img
          src={
            category.icon
              ? `/upload${category.icon}`
              : "/assets/recycle-icon.svg"
          }
          alt={category.name}
          className={styles.categoryIcon}
        />
      </div>
      <div className={styles.categoryContent}>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <div className={styles.categoryInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Poin:</span>
            <span className={styles.infoValue}>
              {category.points_per_unit || 0} poin/{category.unit || "unit"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteTypeCard;
