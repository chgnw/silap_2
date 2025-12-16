import React from "react";
import { FaRecycle } from "react-icons/fa";
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
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryIconWrapper}>
        {category.icon && !imageError ? (
          <img
            src={`/upload${category.icon}`}
            alt={category.name}
            className={styles.categoryIcon}
            onError={() => setImageError(true)}
          />
        ) : (
          <FaRecycle className={styles.categoryIcon} />
        )}
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
