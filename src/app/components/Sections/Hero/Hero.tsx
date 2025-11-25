'use-client'

import Image from 'next/image';
import styles from './hero.module.css';

export default function Hero() {
    return (
        <>
            {/* Hero Section */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    SATU APLIKASI<br />
                    UNTUK <span className={styles.heroUnderline}>SEMUA</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    <img src="/assets/angled-arrow-icon.png" alt="arrow icon" className={styles.arrow} />
                    Buang sampah sat set ya pakai SILAP!
                </p>
            </div>
        </>
    );
}