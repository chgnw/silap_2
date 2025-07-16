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
                    <Image src="/assets/angled-arrow-icon.png" alt="arrow icon" width={60} height={50} />
                    Buang sampah sat set ya pakai SILAP!
                </p>
            </div>
        </>
    );
}