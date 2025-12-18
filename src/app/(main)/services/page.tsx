'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import styles from './services.module.css';
import pricingStyles from '../pricing/pricing.module.css';

interface FAQ {
    question: string;
    answer: string;
}

export default function ServicesPage() {
    const statsRef = useRef<HTMLElement | null>(null);
    const fleetTrackRef = useRef<HTMLDivElement | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [faqItems, setFaqItems] = useState<FAQ[]>([]);
    const alurRef = useRef<HTMLDivElement | null>(null);


    const achievements = [
        { value: '50.000+', label: 'Pengguna Aktif' },
        { value: '98 Kota', label: 'Cakupan Layanan' },
        { value: '4 Juta', label: 'Mitra Driver' },
        { value: '10 Jt Ton', label: 'Sampah Dikelola' },
    ];

    const silapBenefits = [
        'Jadwal pickup fleksibel',
        'Laporan komposisi sampah',
        'Poin & Reward menarik',
        'Tracking driver real-time',
        'Pembayaran cashless mudah',
        'Edukasi pemilahan sampah',
    ];

    const conventionalDrawbacks = [
        'Jadwal tidak menentu',
        'Tidak ada laporan data',
        'Tidak ada insentif',
        'Tidak bisa dilacak',
        'Pembayaran manual',
        'Kurang edukasi',
    ];

    const processSteps = [
        { title: 'Pemilahan sampah dari rumah', icon: '/assets/process-1.png' },
        { title: 'Simpan di wadah terpisah', icon: '/assets/process-2.png' },
        { title: 'Order lewat aplikasi', icon: '/assets/process-3.png' },
        { title: 'Armada menjemput', icon: '/assets/process-4.png' },
        { title: 'Penimbangan & Pencatatan', icon: '/assets/process-5.png' },
        { title: 'Pengolahan di pusat SILAP', icon: '/assets/process-6.png' },
        { title: 'Residu seminimal mungkin', icon: '/assets/process-7.png' },
    ];

    const fleets = [
        { name: 'Motor Box', capacity: 'Kapasitas 100 Kg', image: '/assets/MotorBox.png' },
        { name: 'Pickup Box', capacity: 'Kapasitas 1 Ton', image: '/assets/MobilBox.png' },
        { name: 'Pickup Besar', capacity: 'Kapasitas 2 Ton', image: '/assets/MobilBox.png' },
        { name: 'Truk Engkel', capacity: 'Kapasitas 4 Ton', image: '/assets/MobilBox.png' },
        { name: 'Armphibious', capacity: 'Khusus Banjir', image: '/assets/MobilBox.png' },
    ];

    const coverageCities = ['Jakarta', 'Depok', 'Bekasi', 'Tangerang', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Bali', 'Medan'];

    // Fetch FAQs from API
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('/api/faq');
                const result = await response.json();

                if (result.message === 'SUCCESS' && result.data) {
                    setFaqItems(result.data);
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            }
        };

        fetchFaqs();
    }, []);

    // MATCHING PRICING DATA EXACTLY
    const pricingPlans = [
        {
            name: 'Basic',
            price: 'Rp 49rb',
            period: '/bln',
            desc: 'Cocok untuk pemula yang ingin mulai peduli lingkungan.',
            features: ['Penjemputan 1x seminggu', 'Kapasitas 5kg', 'Laporan dasar', 'Akses artikel edukasi'],
            popular: false,
        },
        {
            name: 'Pro',
            price: 'Rp 149rb',
            period: '/bln',
            desc: 'Pilihan terbaik untuk keluarga dan gaya hidup zero waste.',
            features: ['Penjemputan 2x seminggu', 'Kapasitas 15kg', 'Laporan detail', 'Wadah terpisah gratis', 'Poin reward ganda'],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Hubungi',
            period: '',
            desc: 'Solusi manajemen limbah terpadu untuk bisnis Anda.',
            features: ['Jadwal fleksibel (harian)', 'Kapasitas tak terbatas', 'Audit & Laporan ESG', 'Account Manager', 'Sertifikat Zero Waste'],
            popular: false,
        },
    ];

    const testimonials = [
        { name: 'Siti Rahma', role: 'Ibu Rumah Tangga', text: 'Semenjak pakai SILAP, rumah jadi lebih bersih dan nggak bingung lagi mau buang sampah elektronik kemana. Drivernya sopan banget!', image: 'https://ui-avatars.com/api/?name=Siti+Rahma&background=random' },
        { name: 'Budi Hartono', role: 'Pemilik Cafe "Kopi Senja"', text: 'Sangat membantu operasional cafe kami. Laporan komposisi sampahnya detail, jadi kami bisa evaluasi food waste cafe.', image: 'https://ui-avatars.com/api/?name=Budi+Hartono&background=random' },
        { name: 'Dinda Kirana', role: 'Mahasiswi', text: 'Suka banget sama fitur reward-nya! Jadi makin semangat milah sampah. Aplikasinya juga user friendly.', image: 'https://ui-avatars.com/api/?name=Dinda+Kirana&background=random' }
    ];

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
                    <p className={styles.heroKicker}>#BebasSampahBersamaSILAP</p>
                    <h1>Kelola Sampah Lebih Bijak untuk Masa Depan Bumi</h1>
                    <p className={styles.heroSubtitle}>
                        Ubah caramu memandang sampah. Dengan SILAP, sampahmu dijemput, dipilah, dan diolah secara bertanggung jawab. Jadilah bagian dari solusi, bukan polusi.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/pricing" className={styles.btnPrimary}>Mulai Langganan</Link>
                        <a
                            href="#"
                            className={styles.btnSecondary}
                            onClick={(e) => {
                                e.preventDefault();
                                alurRef.current?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Pelajari Cara Kerja
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
                {achievements.map((item) => (
                    <div key={item.label} className={styles.statItem}>
                        <div className={styles.statValue}>{item.value}</div>
                        <div className={styles.statLabel}>{item.label}</div>
                    </div>
                ))}
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Mengapa Memilih SILAP?</h2>
                    <p>Bandingkan pengalaman pengelolaan sampah cerdas vs konvensional.</p>
                </div>
                <div className={styles.benefitWrapper}>
                    <div className={styles.benefitColumn}>
                        <div className={`${styles.benefitPill} ${styles.silap}`}>Kelebihan SILAP</div>
                        <div className={`${styles.benefitCard} ${styles.benefitSilap}`}>
                            <ul>
                                {silapBenefits.map((benefit) => (
                                    <li key={benefit} className={styles.benefitItem}>
                                        <span className={styles.benefitIcon}>✓</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={styles.benefitColumn}>
                        <div className={`${styles.benefitPill} ${styles.conventional}`}>Cara Lama</div>
                        <div className={`${styles.benefitCard} ${styles.benefitConventional}`}>
                            <ul>
                                {conventionalDrawbacks.map((drawback) => (
                                    <li key={drawback} className={styles.benefitItem}>
                                        <span className={styles.benefitIcon} style={{ background: 'rgba(255,255,255,0.1)' }}>✕</span>
                                        {drawback}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={alurRef} className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Alur Layanan</h2>
                    <p>Proses transparan dari rumah Anda hingga pusat pengolahan.</p>
                </div>
                <div className={styles.processGrid}>
                    {processSteps.map((step, i) => (
                        <div key={step.title} className={styles.processCard}>
                            <span className={styles.stepBadge}>{i + 1}</span>
                            <div className={styles.processIcon}>
                                <img src={step.icon} alt={step.title} />
                            </div>
                            <p>{step.title}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Pilihan Paket Langganan</h2>
                    <p>Sesuaikan dengan kebutuhan rumah atau bisnis Anda.</p>
                </div>
                {/* USING PRICING.MODULE.CSS FOR EXACT MATCH */}
                <div className={pricingStyles.pricingGrid}>
                    {pricingPlans.map((tier) => (
                        <div key={tier.name} className={`${pricingStyles.pricingCard} ${tier.popular ? pricingStyles.popular : ''}`}>
                            {tier.popular && <div className={pricingStyles.popularBadge}>Popular</div>}
                            <div className={pricingStyles.cardHeader}>
                                <h3>{tier.name}</h3>
                                <div className={pricingStyles.price}>
                                    {tier.price}<span>{tier.period}</span>
                                </div>
                                <p className={pricingStyles.description}>{tier.desc}</p>
                            </div>
                            <ul className={pricingStyles.features}>
                                {tier.features.map((f) => (
                                    <li key={f}><span className={pricingStyles.check}>✓</span> {f}</li>
                                ))}
                            </ul>
                            <Link
                                href={`/pricing?plan=${tier.name}`}
                                className={pricingStyles.ctaBtn}
                                style={{ textAlign: 'center' }}
                            >
                                Pilih Paket
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Armada Kami</h2>
                    <p>Siap menjemput di segala kondisi medan.</p>
                </div>
                <div className={styles.fleetCarousel}>
                    <button className={styles.fleetNav} aria-label="Sebelumnya" onClick={() => scrollFleet('left')}>
                        ‹
                    </button>
                    <div ref={fleetTrackRef} className={styles.fleetTrack}>
                        {fleets.map((fleet, idx) => (
                            <div key={`${fleet.name}-${idx}`} className={styles.fleetCard}>
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

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Apa Kata Mereka?</h2>
                    <p>Cerita mereka yang telah beralih ke gaya hidup minim sampah.</p>
                </div>
                <div className={styles.testimonialGrid}>
                    {testimonials.map((testi, idx) => (
                        <div key={idx} className={styles.testimonialCard}>
                            <div className={styles.testimonialContent}>
                                <div className={styles.quoteIcon}>“</div>
                                <p className={styles.testimonialText}>{testi.text}</p>
                            </div>
                            <div className={styles.testimonialUser}>
                                <img src={testi.image} alt={testi.name} className={styles.testimonialAvatar} />
                                <div className={styles.credential}>
                                    <h4>{testi.name}</h4>
                                    <p>{testi.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Jangkauan Layanan</h2>
                    <p>Kami hadir di kota-kota besar Indonesia.</p>
                </div>
                <div className={styles.coverageWrap}>
                    <div className={styles.coverageMap}>
                        <img src="/assets/coverage-map.png" alt="Peta Layanan SILAP" className={styles.coverageMapImg} />
                        <div className={styles.mapHint}>Peta Interaktif Layanan</div>
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
                    <p>Punya pertanyaan? Temukan jawabannya di sini.</p>
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

            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2>Siap Bergabung dengan Gerakan Bebas Sampah?</h2>
                    <p>Jangan tunda lagi. Mulai langkah kecilmu hari ini bersama ribuan pengguna SILAP lainnya.</p>
                    <a href="/login" className={styles.ctaBtn}>Daftar Sekarang</a>
                </div>
            </section>
        </main>
    );
}