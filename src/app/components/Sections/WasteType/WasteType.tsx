'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import styles from './WasteType.module.css'

import WasteTypes from './components/WasteData';
import WasteTypeCard from "../../Medium/WasteTypeCard/WasteTypeCard";
import { Container } from 'react-bootstrap';

export default function WasteTypeSection() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(1);

    const handleCategorySelect = (id: number | null) => {
        setSelectedCategoryId(prevId => (prevId === id ? null : id));
    };

    const selectedSubCategories = useMemo(() => {
        if (!selectedCategoryId) return [];
        const selectedCategory = WasteTypes.find(cat => cat.id === selectedCategoryId);
        return selectedCategory ? selectedCategory.SubCategory : [];
    }, [selectedCategoryId]);
    
    return (
        <Container>
            <div className={styles.sectionHeader}>
                <h1>Jenis Sampah</h1>
                <p>Lihat semua jenis sampah yang kami daur ulang</p>
            </div>

            <div className={styles.sectionWrapper}>
                <div className={styles.layoutContainer}>

                    <div className={styles.leftColumn}>
                        <div className={styles.categoryGrid}>
                            {WasteTypes.map(category => (
                                <WasteTypeCard
                                    key={category.id}
                                    category={category}
                                    isSelected={selectedCategoryId === category.id}
                                    onSelect={handleCategorySelect}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.subCategoryContainer}>
                            <div className={styles.recycleIconWrapper}>
                                <Image src='/assets/recycle-icon.svg' alt='Recycle Icon' width={107} height={107} />
                            </div>

                            {selectedSubCategories.length > 0 ? (
                                <div className={styles.subCategoryGrid}>
                                    {selectedSubCategories.map(sub => (
                                        <div key={sub.id} className={styles.subCategoryItem}>
                                            <img src={sub.imageUrl} alt={sub.name} className={styles.subCategoryImg} />
                                            <div className={styles.subCategoryOverlay}>{sub.name}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Select a category to see items.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}