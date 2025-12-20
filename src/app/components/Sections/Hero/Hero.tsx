'use-client'

import Image from 'next/image';
import styles from './hero.module.css';

import TargetUser from '../TargetUser/TargetUser';

export default function Hero() {
    return (
        <>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.blob1}></div>
                <div className={styles.blob2}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        SATU APLIKASI<br />
                        UNTUK <span className={styles.heroUnderline}>SEMUA</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Buang sampah sat set ya pakai SILAP!
                    </p>

                    <div style={{ marginTop: '3rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <TargetUser />
                    </div>
                </div>
            </div>
        </>
    );
}