'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './WasteType.module.css'

import WasteTypeCard from "../../Medium/WasteTypeCard/WasteTypeCard";

export default function WasteTypeSection() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/waste')
        .then(res => res.json())
        .then(data => {
            // console.log('API response:', data)
            setCategories(Array.isArray(data) ? data : [])
        })
        .catch(err => console.error('Error fetching waste data:', err))
    }, [])

    const selectedSubCategories = useMemo(() => {
        if (!selectedCategoryId) return []
        const selected = categories.find(cat => cat.id === selectedCategoryId)
        return selected ? selected.SubCategory : []
    }, [selectedCategoryId, categories])

    const handleCategorySelect = (id: number | null) => {
        setSelectedCategoryId(prev => (prev === id ? null : id))
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <h1>Jenis Sampah</h1>
                <p>Lihat semua jenis sampah yang kami daur ulang</p>
            </div>

            <div className={styles.sectionWrapper}>
                <div className={styles.layoutContainer}>

                    <div className={styles.leftColumn}>
                        <div className={styles.categoryGrid}>
                            {categories.map(category => (
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
                                <img src='/assets/recycle-icon.svg' alt='Recycle Icon' />
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
                                <p>Pilih kategori untuk melihat itemnya.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}