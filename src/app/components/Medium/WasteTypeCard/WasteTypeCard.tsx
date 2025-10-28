import React from 'react';
import styles from './WasteTypeCard.module.css';
import * as FaIcons from "react-icons/fa";
import * as GiIcons from "react-icons/gi";
import * as MdIcons from "react-icons/md";

interface SubCategory {
    id: number;
    name: string;
    imageUrl: string;
}

interface Category {
    id: number;
    name: string;
    icon: string; // dari backend
    SubCategory: SubCategory[];
}

interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const CategoryCard = ({ category, isSelected, onSelect }: CategoryCardProps) => {
    const allIcons = { ...FaIcons, ...GiIcons, ...MdIcons };
    const Icon = allIcons[category.icon as keyof typeof allIcons];

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