'use client'

import Image from 'next/image';
import { FaSmile, FaShieldAlt, FaClock, FaGift } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import Solusi from '../../Medium/Solusi/Solusi';
import styles from './solusi.module.css';

// Data untuk fitur-fitur
const features = [
  {
    icon: <FaSmile size={72} color="#FFFFFF" />,
    title: 'User friendly banget',
    description: 'Buat semua umur, dari anak muda sampai orang tua. Nggak ribet, tinggal klik langsung jalan.'
  },
  {
    icon: <FaShieldAlt size={72} color="#FFFFFF" />,
    title: 'Lingkungan jadi lebih terjaga',
    description: 'Bantu pisahin sampah, dukung daur ulang. Langkah kecil kamu bisa jadi dampak besar buat bumi.'
  },
  {
    icon: <FaClock size={72} color="#FFFFFF" />,
    title: 'Transparan & Real time',
    description: 'Lihat proses pengangkutan & progress daur ulang langsung dari HP kamu.'
  },
  {
    icon: <FaGift size={72} color="#FFFFFF" />,
    title: 'Ada rewardnya juga!',
    description: 'Kelola sampah, dapat poin. Poin bisa ditukar jadi voucher, produk, atau hal menarik lainnya.'
  }
];

export default function HeroBanner() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.banner}>
      {/* Kolom Kiri - Teks Utama */}
      <div className={styles.leftWrapper}>
        <div className={styles.bannerTextWrapper}>
          <h1 className={styles.bannerText}>
            {isMobile ? (
            <>
              Solusi Digital untuk Kota yang Lebih
              <p className={styles.bersihImageWrapper}>
                <Image src="/assets/Bersih.png" alt="Bersih" width={320} height={120} />
              </p>
            </>
          ) : (
            <>
              Solusi Digital <br />
              untuk Kota <br />
              yang Lebih
              <span className={styles.bersihImageWrapper}>
                <Image src="/assets/Bersih.png" alt="Bersih" width={320} height={120} />
              </span>
            </>
          )}
          </h1>
        </div>
      </div>

      {/* Kolom Kanan - Daftar Fitur */}
      <div className={styles.rightWrapper}>
        {features.map((feature, index) => (
          <Solusi
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
}