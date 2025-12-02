import React from 'react';
import styles from './WasteTypeCard.module.css';

interface SubCategory {
    id: number;
    name: string;
    imageUrl: string;
}

interface Category {
    id: number;
    name: string;
    icon: string;
    SubCategory: SubCategory[];
}

interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const CategoryCard = ({ category, isSelected, onSelect }: CategoryCardProps) => {
    return (
        <div className={styles.categoryItem} onClick={() => onSelect(category.id)}>
            <img 
                src={category.icon} 
                alt={category.name}
                className={`${styles.categoryIcon} ${isSelected ? styles.active : ''}`}
            />
            <span className={styles.categoryName}>{category.name}</span>
            <div className={styles.categoryButton}>
                {isSelected ? '−' : '+'}
            </div>
        </div>
    );
};

export default CategoryCard;