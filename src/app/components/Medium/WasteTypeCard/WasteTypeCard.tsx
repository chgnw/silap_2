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
    Icon: React.ComponentType<any>;
    SubCategory: {
        id: number;
        name: string;
        imageUrl: string;
    }[];
}

interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const CategoryCard = ({ category, isSelected, onSelect }: CategoryCardProps) => {
    const Icon = category.Icon;

    return (
        <div className={styles.categoryItem} onClick={() => onSelect(category.id)}>
            <Icon className={`${styles.categoryIcon} ${isSelected ? styles.active : ''}`}/>
            <span className={styles.categoryName}>{category.name}</span>
            <div className={styles.categoryButton}>
                {isSelected ? '−' : '+'}
            </div>
        </div>
    );
};

export default CategoryCard;