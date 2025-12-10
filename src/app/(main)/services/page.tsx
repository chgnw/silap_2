'use client';

import { useRef, useState } from 'react';
import styles from './services.module.css';

export default function ServicesPage() {
    const statsRef = useRef<HTMLElement | null>(null);
    const fleetTrackRef = useRef<HTMLDivElement | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const achievements = [
        { value: '50.000+', label: 'Pengguna Aktif' },
        { value: '98 Kota', label: '4 Juta Driver' },
        { value: '10 Jt Ton', label: 'Sampah yang terkumpul' },
    ];

    const silapBenefits = [
        'Pilih tanggal & jam waktu pick up',
        'Laporan komposisi sampah',
        'Mendapat poin & reward',
        'Tracking driver real time',
        'Pembayaran yang mudah',
        'Notifikasi status pesanan',
        'Riwayat & data tersimpan otomatis',
        'Edukasi & dukungan pemilahan',
        'Fleksibel & scalable',
    ];

    const conventionalDrawbacks = [
        'Tidak bisa pilih waktu',
        'Tidak ada tracking',
        'Tidak ada poin & reward',
        'Tidak ada laporan komposisi',
        'Tidak ada pencatatan digital',
        'Harus menunggu/antar sendiri',
        'Minim edukasi',
        'Pilihan armada terbatas',
    ];

    const processSteps = [
        { title: 'Pemilahan sampah dari client', icon: '/assets/process-1.png' },
        { title: 'Penyimpanan sampah di TPS tempat client', icon: '/assets/process-2.png' },
        { title: 'Order jadwal pick up', icon: '/assets/process-3.png' },
        { title: 'Armada SILAP menuju lokasi client', icon: '/assets/process-4.png' },
        { title: 'Driver menghitung sampah client', icon: '/assets/process-5.png' },
        { title: 'Sampah diolah di rumah pengolahan SILAP', icon: '/assets/process-6.png' },
        { title: 'Residu dikirim ke TPA', icon: '/assets/process-7.png' },
    ];

    const fleets = [
        { name: 'Motor Box', capacity: 'Kapasitas 100 Kg', image: '/assets/MotorBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
    ];

    const coverageCities = ['Jakarta', 'Depok', 'Bekasi', 'Tangerang', 'Bandung', 'Surabaya', 'Yogyakarta'];

    const faqItems = [
        { question: 'Bagaimana cara menjadwalkan penjemputan?', answer: 'Pilih jadwal di aplikasi SILAP, tentukan tanggal dan jam, lalu konfirmasi penjemputan.' },
        { question: 'Apakah ada biaya minimum?', answer: 'Biaya menyesuaikan jenis layanan dan jarak, detail biaya muncul sebelum Anda konfirmasi pesanan.' },
        { question: 'Apakah saya mendapatkan laporan komposisi sampah?', answer: 'Ya, setiap penjemputan disertai laporan komposisi sampah yang bisa diunduh di aplikasi.' },
    ];

    const processRowTop = processSteps.slice(0, 4);
    const processRowBottom = processSteps.slice(4);

    const scrollFleet = (direction: 'left' | 'right') => {
        if (!fleetTrackRef.current) return;
        const cardWidth = fleetTrackRef.current.firstElementChild?.clientWidth ?? 260;
        const scrollBy = cardWidth + 16;
        fleetTrackRef.current.scrollBy({ left: direction === 'left' ? -scrollBy : scrollBy, behavior: 'smooth' });
    };

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.heroKicker}>Layanan Penjemputan Sampah</p>
                    <h1>Yuk, jadi pahlawan lingkungan dari rumah!</h1>
                    <p className={styles.heroSubtitle}>
                        Sekadar buang sampah di tong sampah ternyata belum cukup lho buat nyelamatin bumi dari
                        tumpukan sampah di TPA. Langkah kecil yang bisa kamu lakukan adalah memilah sampah dan
                        menyetorkannya ke SILAP. Gampang, kan?
                    </p>
                    <div className={styles.actions}>
                        <a href="#" className={styles.btnPrimary}>
                            Kirim Sekarang
                        </a>
                        <a href="#" className={styles.btnSecondary}>
                            Lihat Selengkapnya
                        </a>
                    </div>
                </div>
                <button
                    className={styles.scrollDown}
                    aria-label="Scroll ke bawah"
                    onClick={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <img src="/assets/ButtonforScrollButtom.svg" alt="Scroll down" />
                </button>
            </section>

            <section ref={statsRef} className={styles.statsCard}>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>PENCAPAIAN KAMI</div>
                    <div className={styles.statNote}>Kontribusi dari individu</div>
                </div>
                {achievements.map((item) => (
                    <div key={item.label} className={styles.statItem}>
                        <div className={styles.statValue}>{item.value}</div>
                        <div className={styles.statLabel}>{item.label}</div>
                    </div>
                ))}
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Benefit Menggunakan SILAP</h2>
                    <p>Bandingkan kemudahan SILAP dengan cara konvensional.</p>
                </div>
                <div className={styles.benefitGrid}>
                    <div className={`${styles.benefitCard} ${styles.benefitSilap}`}>
                        <div className={styles.benefitPill}>SILAP</div>
                        <ul>
                            {silapBenefits.map((benefit) => (
                                <li key={benefit} className={styles.benefitItem}>
                                    <span className={styles.benefitIcon}>✓</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={`${styles.benefitCard} ${styles.benefitConventional}`}>
                        <div className={styles.benefitPill}>Konvensional</div>
                        <ul>
                            {conventionalDrawbacks.map((drawback) => (
                                <li key={drawback} className={styles.benefitItem}>
                                    <span className={styles.benefitIcon}>✕</span>
                                    {drawback}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Alur Pengolahan Sampah</h2>
                    <p>Tahapan layanan SILAP dari pengambilan sampai pengolahan.</p>
                </div>
                <div className={styles.processRows}>
                    <div className={styles.processRow}>
                        {processRowTop.map((step, i) => (
                            <div key={step.title} className={styles.processCard}>
                                <div className={styles.processIcon}>
                                    <span className={styles.stepBadge}>{i + 1}</span>
                                    <img src={step.icon} alt={step.title} />
                                </div>
                                <p>{step.title}</p>
                            </div>
                        ))}
                    </div>
                    <div className={`${styles.processRow} ${styles.processRowBottom}`}>
                        {processRowBottom.map((step, i) => (
                            <div key={step.title} className={styles.processCard}>
                                <div className={styles.processIcon}>
                                    <span className={styles.stepBadge}>{i + 5}</span>
                                    <img src={step.icon} alt={step.title} />
                                </div>
                                <p>{step.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Armada</h2>
                    <p>Pilih armada sesuai kebutuhan pengambilan sampahmu.</p>
                </div>
                <div className={styles.fleetCarousel}>
                    <button className={styles.fleetNav} aria-label="Sebelumnya" onClick={() => scrollFleet('left')}>
                        ‹
                    </button>
                    <div ref={fleetTrackRef} className={styles.fleetTrack}>
                        {fleets.map((fleet) => (
                            <div key={fleet.name} className={styles.fleetCard}>
                                <div className={styles.fleetImage}>
                                    <img src={fleet.image} alt={fleet.name} />
                                </div>
                                <div className={styles.fleetInfo}>
                                    <div className={styles.fleetName}>{fleet.name}</div>
                                    <div className={styles.fleetCapacity}>{fleet.capacity}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className={styles.fleetNav} aria-label="Berikutnya" onClick={() => scrollFleet('right')}>
                        ›
                    </button>
                </div>
            </section>

            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Wilayah Layanan SILAP</h2>
                    <p>Area yang telah dijangkau lengkap dengan buffer zone layanan.</p>
                </div>
                <div className={styles.coverageWrap}>
                    <div className={styles.coverageMap}>
                        <div className={styles.bufferRing}></div>
                        <div className={styles.bufferRingSecondary}></div>
                        <div className={styles.mapHint}>Ganti background map di CSS sesuai aset Anda</div>
                    </div>
                    <div className={styles.coverageList}>
                        {coverageCities.map((city) => (
                            <span key={city} className={styles.coverageChip}>
                                {city}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>FAQ</h2>
                    <p>Pertanyaan yang sering diajukan seputar layanan SILAP.</p>
                </div>
                <div className={styles.faqList}>
                    {faqItems.map((item, idx) => (
                        <div key={item.question} className={styles.faqItem}>
                            <button
                                className={styles.faqQuestion}
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                aria-expanded={openFaq === idx}
                            >
                                <span>{item.question}</span>
                                <span className={styles.faqToggle}>{openFaq === idx ? '−' : '+'}</span>
                            </button>
                            {openFaq === idx && <p className={styles.faqAnswer}>{item.answer}</p>}
                        </div>
                    ))}
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <img src="/assets/silap-logo.svg" alt="SILAP" />
                        <p>Solusi pengelolaan sampah terpadu yang praktis dan berkelanjutan.</p>
                    </div>
                    <div className={styles.footerCopy}>© 2025 SILAP. All rights reserved.</div>
                </div>
            </footer>
        </main>
    );
}