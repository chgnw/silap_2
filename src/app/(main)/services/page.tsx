'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './services.module.css';
import EventCalculator from '@/app/components/Sections/EventCalculator/EventCalculator';
import pricingStyles from '../pricing/pricing.module.css';

interface FAQ {
    question: string;
    answer: string;
}

interface VehicleCategory {
    id: number;
    category_name: string;
    min_weight: number;
    max_weight: number | null;
    description: string | null;
    image_path: string | null;
}

interface SubscriptionPlan {
    id: number;
    plan_name: string;
    description: string | null;
    price: number;
    duration_days: number;
    pickup_frequency: string | null;
    max_weight: number | null;
    features: string | null;
    is_popular: boolean;
}

export default function ServicesPage() {
    const router = useRouter();
    const { status } = useSession();
    const statsRef = useRef<HTMLElement | null>(null);
    const fleetTrackRef = useRef<HTMLDivElement | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [faqItems, setFaqItems] = useState<FAQ[]>([]);
    const alurRef = useRef<HTMLDivElement | null>(null);
    const calculatorRef = useRef<HTMLElement | null>(null);

    // Dynamic data from API
    const [fleets, setFleets] = useState<VehicleCategory[]>([]);
    const [pricingPlans, setPricingPlans] = useState<SubscriptionPlan[]>([]);

    // Payment Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet' | 'qris'>('bank');
    const [paymentStep, setPaymentStep] = useState<'details' | 'success'>('details');
    const [proofUploaded, setProofUploaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openPaymentModal = (planName: string, price: string) => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/services');
            return;
        }
        setSelectedPlan({ name: planName, price });
        setPaymentStep('details');
        setPaymentMethod('bank');
        setProofUploaded(false); // Reset upload state
        setCopied(false);
        setShowModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProofUploaded(true);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentSubmit = () => {
        // Simulate API call
        setTimeout(() => {
            setPaymentStep('success');
        }, 1000);
    };

    // Fleet carousel pagination
    const [fleetPage, setFleetPage] = useState(0);
    const getItemsPerPage = () => {
        if (typeof window === 'undefined') return 3;
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 900) return 2;
        return 3;
    };


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

    const coverageCities = ['Jakarta', 'Depok', 'Bekasi', 'Tangerang', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Bali', 'Medan'];

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch FAQs
                const faqRes = await fetch('/api/faq');
                const faqData = await faqRes.json();
                if (faqData.message === 'SUCCESS' && faqData.data) {
                    setFaqItems(faqData.data);
                }

                // Fetch vehicle categories (fleets)
                const fleetRes = await fetch('/api/public/vehicle-categories');
                const fleetData = await fleetRes.json();
                if (fleetData.message === 'SUCCESS' && fleetData.data) {
                    setFleets(fleetData.data);
                }

                // Fetch subscription plans (pricing)
                const planRes = await fetch('/api/public/subscription-plans');
                const planData = await planRes.json();
                if (planData.message === 'SUCCESS' && planData.data) {
                    setPricingPlans(planData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Helper to format price
    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `Rp ${(price / 1000000).toFixed(0)} jt`;
        } else if (price >= 1000) {
            return `Rp ${(price / 1000).toFixed(0)}rb`;
        }
        return `Rp ${price}`;
    };

    // Helper to parse features
    const parseFeatures = (features: string | null): string[] => {
        if (!features) return [];
        return features.split(',').map(f => f.trim()).filter(f => f.length > 0);
    };

    // Helper to format capacity
    const formatCapacity = (minWeight: number, maxWeight: number | null) => {
        if (maxWeight === null) {
            return `Kapasitas ${minWeight}+ Kg`;
        }
        return `Kapasitas ${maxWeight} Kg`;
    };

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

    const getFleetImage = (category: string) => {
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('motor')) return '/assets/MotorBak200KG.png';
        if (lowerCat.includes('mobil') || lowerCat.includes('pickup') || lowerCat.includes('truk')) return '/assets/MobilBak1Ton.png';
        return '/assets/MobilBox.png';
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
                    <p>Proses transparan dari rumah kamu hingga pusat pengolahan.</p>
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
                    <p>Sesuaikan dengan kebutuhan rumah atau bisnis kamu.</p>
                </div>
                {/* USING PRICING.MODULE.CSS FOR EXACT MATCH */}
                <div className={pricingStyles.pricingGrid}>
                    {/* 1. Paket Individu */}
                    <div className={pricingStyles.pricingCard}>
                        <div className={pricingStyles.cardHeader}>
                            <h3>Paket Individu</h3>
                            <div className={pricingStyles.price}>
                                Rp 49.000<span>/bulan</span>
                            </div>
                            <p className={pricingStyles.description}>Rumah tangga & pengguna personal</p>
                        </div>
                        <ul className={pricingStyles.features}>
                            <li><span className={pricingStyles.check}>✓</span> Kuota sampah: 30 kg / bulan</li>
                            <li><span className={pricingStyles.check}>✓</span> Pickup: 2x per minggu</li>
                            <li><span className={pricingStyles.check}>✓</span> Jadwal pick up flexibel</li>
                            <li><span className={pricingStyles.check}>✓</span> Multi lokasi</li>
                            <li><span className={pricingStyles.check}>✓</span> Dashboard monitoring</li>
                        </ul>
                        <button
                            onClick={() => openPaymentModal('Paket Individu', 'Rp 49.000')}
                            className={pricingStyles.ctaBtn}
                            style={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}
                        >
                            Pilih Paket
                        </button>
                    </div>

                    {/* 2. Paket Bisnis */}
                    <div className={`${pricingStyles.pricingCard} ${pricingStyles.popular}`}>
                        <div className={pricingStyles.popularBadge}>Best Value</div>
                        <div className={pricingStyles.cardHeader}>
                            <h3>Paket Bisnis</h3>
                            <div className={pricingStyles.price}>
                                Rp 299.000<span>/bulan</span>
                            </div>
                            <p className={pricingStyles.description}>UMKM, kantor, restoran, bisnis skala menengah</p>
                        </div>
                        <ul className={pricingStyles.features}>
                            <li><span className={pricingStyles.check}>✓</span> Kuota sampah: 300 kg / bulan</li>
                            <li><span className={pricingStyles.check}>✓</span> Pickup: 7x per minggu</li>
                            <li><span className={pricingStyles.check}>✓</span> Jadwal pick up flexibel</li>
                            <li><span className={pricingStyles.check}>✓</span> Multi lokasi outlet</li>
                            <li><span className={pricingStyles.check}>✓</span> Dashboard monitoring</li>
                        </ul>
                        <button
                            onClick={() => openPaymentModal('Paket Bisnis', 'Rp 299.000')}
                            className={pricingStyles.ctaBtn}
                            style={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}
                        >
                            Pilih Paket
                        </button>
                    </div>

                    {/* 3. Paket Event */}
                    <div className={pricingStyles.pricingCard}>
                        <div className={pricingStyles.popularBadge} style={{ background: '#2f5e44' }}>Custom</div>
                        <div className={pricingStyles.cardHeader}>
                            <h3>Paket Event</h3>
                            <div className={pricingStyles.price} style={{ fontSize: '2rem' }}>
                                Estimasi<span>/event</span>
                            </div>
                            <p className={pricingStyles.description}>Tidak menggunakan harga & kuota statis.</p>
                        </div>
                        <ul className={pricingStyles.features}>
                            <li><span className={pricingStyles.check}>✓</span> Form Demo Estimasi Biaya</li>
                            <li><span className={pricingStyles.check}>✓</span> Cocok untuk event apapun</li>
                            <li><span className={pricingStyles.check}>✓</span> Tanpa kuota statis</li>
                            <li><span className={pricingStyles.check}>✓</span> Opsi Branding & Support</li>
                            <li><span className={pricingStyles.check}>✓</span> Jadwal pick up flexibel</li>
                            <li><span className={pricingStyles.check}>✓</span> Multi lokasi</li>
                            <li><span className={pricingStyles.check}>✓</span> Dashboard monitoring</li>
                        </ul>
                        <button
                            onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className={pricingStyles.ctaBtn}
                            style={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}
                        >
                            Hitung Estimasi
                        </button>
                    </div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.sectionHeader}>
                    <h2>Armada Kami</h2>
                    <p>Siap menjemput di segala kondisi medan.</p>
                </div>
                <div className={styles.fleetCarousel}>
                    {fleets.length > getItemsPerPage() && (
                        <button
                            className={styles.fleetNav}
                            aria-label="Sebelumnya"
                            onClick={() => {
                                const totalPages = Math.ceil(fleets.length / getItemsPerPage());
                                setFleetPage(p => p === 0 ? totalPages - 1 : p - 1);
                            }}
                        >
                            ‹
                        </button>
                    )}
                    <div ref={fleetTrackRef} className={styles.fleetTrack}>
                        {fleets
                            .slice(fleetPage * getItemsPerPage(), (fleetPage + 1) * getItemsPerPage())
                            .map((fleet, idx) => (
                                <div key={`${fleet.category_name}-${idx}`} className={styles.fleetCard}>
                                    <div className={styles.fleetImage}>
                                        <img src={getFleetImage(fleet.category_name)} alt={fleet.category_name} />
                                    </div>
                                    <div className={styles.fleetInfo}>
                                        <div className={styles.fleetName}>{fleet.category_name}</div>
                                        <div className={styles.fleetCapacity}>{formatCapacity(fleet.min_weight, fleet.max_weight)}</div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    {fleets.length > getItemsPerPage() && (
                        <button
                            className={styles.fleetNav}
                            aria-label="Berikutnya"
                            onClick={() => {
                                const totalPages = Math.ceil(fleets.length / getItemsPerPage());
                                setFleetPage(p => p >= totalPages - 1 ? 0 : p + 1);
                            }}
                        >
                            ›
                        </button>
                    )}
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



            <section ref={calculatorRef} id="event-calculator">
                <EventCalculator />
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Pertanyaan Umum</h2>
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

            {/* Payment Modal */}
            {showModal && selectedPlan && (
                <div className={pricingStyles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={pricingStyles.modalBox} onClick={(e) => e.stopPropagation()}>
                        <button className={pricingStyles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>

                        {paymentStep === 'success' ? (
                            <div className={pricingStyles.successState}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <div
                                        className={pricingStyles.successIcon}
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, heartbeat 2s infinite 1s'
                                        }}
                                    >
                                        <svg className={pricingStyles.checkmarkSvg} viewBox="0 0 24 24">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        animation: 'burst 0.8s ease-out forwards',
                                        zIndex: 1
                                    }} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', animation: 'fadeIn 0.5s ease 0.2s backwards' }}>Pembayaran Berhasil!</h3>
                                <p style={{ marginBottom: '1rem', animation: 'fadeIn 0.5s ease 0.3s backwards' }}>
                                    Terima kasih telah berlangganan <strong>{selectedPlan.name}</strong>.
                                </p>

                                <div style={{
                                    background: '#f0fdf4',
                                    padding: '1.2rem',
                                    borderRadius: '12px',
                                    border: '1px solid #bbf7d0',
                                    color: '#166534',
                                    fontWeight: '500',
                                    marginBottom: '1rem',
                                    animation: 'fadeIn 0.5s ease 0.4s backwards',
                                    textAlign: 'left'
                                }}>
                                    <p style={{ marginBottom: '0.5rem', fontWeight: '700' }}>📌 Langkah Selanjutnya:</p>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.95rem' }}>
                                        <li style={{ marginBottom: '0.3rem' }}>Admin akan memverifikasi pembayaran kamu (maks. 1x24 jam).</li>
                                        <li>Cek email kamu secara berkala, termasuk folder <strong>Spam</strong> atau <strong>Promosi</strong> (Promotions) untuk info aktivasi.</li>
                                    </ul>
                                </div>

                                <button
                                    className={pricingStyles.payBtn}
                                    onClick={() => setShowModal(false)}
                                    style={{ marginTop: '1rem', animation: 'fadeIn 0.5s ease 0.5s backwards' }}
                                >
                                    Tutup
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className={pricingStyles.modalTitle}>Pembayaran</h3>
                                <div className={pricingStyles.summary} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: 'none' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedPlan.name}</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2f5e44' }}>{selectedPlan.price}</span>
                                </div>

                                <div className={pricingStyles.tabs}>
                                    <button
                                        className={`${pricingStyles.tabBtn} ${paymentMethod === 'bank' ? pricingStyles.active : ''}`}
                                        onClick={() => setPaymentMethod('bank')}
                                    >
                                        Transfer Bank
                                    </button>
                                    <button
                                        className={`${pricingStyles.tabBtn} ${paymentMethod === 'ewallet' ? pricingStyles.active : ''}`}
                                        onClick={() => setPaymentMethod('ewallet')}
                                    >
                                        E-Wallet
                                    </button>
                                    <button
                                        className={`${pricingStyles.tabBtn} ${paymentMethod === 'qris' ? pricingStyles.active : ''}`}
                                        onClick={() => setPaymentMethod('qris')}
                                    >
                                        QRIS
                                    </button>
                                </div>

                                <div className={pricingStyles.paymentContent}>
                                    {paymentMethod === 'bank' && (
                                        <div className={pricingStyles.bankInfo}>
                                            <span className={pricingStyles.infoLabel}>Bank BCA (PT Silap Indonesia)</span>
                                            <span className={pricingStyles.accountNumber}>8230 1234 5678</span>
                                            <button className={pricingStyles.copyBtn} onClick={() => handleCopy('823012345678')}>
                                                {copied ? 'Berhasil Disalin! ✓' : 'Salin No. Rek'}
                                            </button>

                                            <div className={pricingStyles.instructions} style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                                                <h4>Tutorial Pembayaran:</h4>
                                                <ol style={{ fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                                                    <li>Buka M-Banking BCA atau ATM.</li>
                                                    <li>Pilih Transfer Antar Rekening.</li>
                                                    <li>Masukkan No. Rekening di atas.</li>
                                                    <li>Pastikan nama penerima <strong>PT Silap Indonesia</strong>.</li>
                                                    <li>Simpan bukti/struk transfer.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    )}
                                    {paymentMethod === 'ewallet' && (
                                        <div className={pricingStyles.ewalletInfo}>
                                            <span className={pricingStyles.infoLabel}>OVO / Gopay / Dana</span>
                                            <span className={pricingStyles.accountNumber}>0812 3456 7890</span>
                                            <button className={pricingStyles.copyBtn} onClick={() => handleCopy('081234567890')}>
                                                {copied ? 'Berhasil Disalin! ✓' : 'Salin Nomor'}
                                            </button>
                                            <div className={pricingStyles.instructions} style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                                                <h4>Tutorial Pembayaran:</h4>
                                                <ol style={{ fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                                                    <li>Buka aplikasi E-Wallet kamu.</li>
                                                    <li>Pilih menu Transfer / Kirim ke Nomor.</li>
                                                    <li>Masukkan nomor di atas.</li>
                                                    <li>Simpan bukti/struk transfer.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    )}
                                    {paymentMethod === 'qris' && (
                                        <div className={pricingStyles.qrisPlaceholder}>
                                            <img src="/assets/qr-payment-dummy.svg" alt="QRIS" width={150} />
                                            <p style={{ marginTop: '1rem' }}>Scan menggunakan aplikasi pembayaran apapun.</p>
                                        </div>
                                    )}

                                    {/* Upload Proof Form */}
                                    <div style={{ marginTop: '2rem', borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
                                            Upload Bukti Pembayaran <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div
                                            style={{
                                                border: `2px dashed ${proofUploaded ? '#22c55e' : '#cbd5e1'}`,
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: proofUploaded ? '#f0fdf4' : '#f8fafc',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                            />
                                            {proofUploaded ? (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#16a34a' }}>
                                                    <span>✓</span>
                                                    <span>File berhasil diupload</span>
                                                </div>
                                            ) : (
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Klik untuk upload file (JPG, PNG, PDF)</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className={pricingStyles.payBtn}
                                    onClick={handlePaymentSubmit}
                                    disabled={!proofUploaded}
                                    style={{
                                        opacity: proofUploaded ? 1 : 0.5,
                                        cursor: proofUploaded ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Konfirmasi Pembayaran
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}