'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './pricing.module.css';
import EventCalculator from '@/app/components/Sections/EventCalculator/EventCalculator';

interface Tier {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  period: string;
  desc: string;
  features: string[];
  popular: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

function PricingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  // Refs
  const calculatorRef = useRef<HTMLElement | null>(null);

  // Checkout & Payment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet' | 'qris'>('bank');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [proofUploaded, setProofUploaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/public/subscription-plans');
        const result = await response.json();

        if (result.message === 'SUCCESS' && result.data) {
          const mappedTiers: Tier[] = result.data.map((plan: any) => ({
            id: plan.id,
            name: plan.plan_name,
            price: Number(plan.price),
            priceFormatted: formatPrice(Number(plan.price)),
            period: `/${plan.duration_days} hari`,
            desc: plan.description || '',
            features: plan.features ? plan.features.split(',').map((f: string) => f.trim()) : [],
            popular: plan.is_popular === 1,
          }));
          setTiers(mappedTiers);
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      } finally {
        setIsLoadingTiers(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/faq');
        const result = await response.json();

        if (result.message === 'SUCCESS' && result.data) {
          setFaqs(result.data);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  const handleCheckout = (planName: string) => {
    // Require login first
    if (sessionStatus !== 'authenticated') {
      router.push('/login?callbackUrl=/pricing');
      return;
    }

    let tier = tiers.find(t => t.name.toLowerCase().includes(planName.toLowerCase()));

    // Fallback: Check for key words if exact phrase not found
    if (!tier) {
      if (planName.toLowerCase().includes('individu')) {
        tier = tiers.find(t => t.name.toLowerCase().includes('individu'));
      } else if (planName.toLowerCase().includes('bisnis')) {
        tier = tiers.find(t => t.name.toLowerCase().includes('bisnis'));
      }
    }

    if (!tier) {
      console.warn("Plan not found in API:", planName);
      // Fallback: If still not found, create a dummy tier so modal still opens (for testing/demo)
      // This ensures the popup appears even if API data is missing/different
      tier = {
        id: 0, // Invalid ID, payment might fail but modal works
        name: planName,
        price: planName.includes('Bisnis') ? 299000 : 49000,
        priceFormatted: planName.includes('Bisnis') ? 'Rp 299.000' : 'Rp 49.000',
        period: '/bulan',
        desc: 'Paket langganan',
        features: [],
        popular: false
      };
    }

    setSelectedTier(tier);
    setPaymentStatus('idle');
    setPaymentMethod('bank');
    setPaymentError('');
    setTransactionCode('');
    setProofUploaded(false); // Reset upload state
    setIsModalOpen(true);
  };

  useEffect(() => {
    const planName = searchParams.get('plan');
    if (planName && tiers.length > 0) {
      handleCheckout(planName);
    }
  }, [searchParams, tiers, sessionStatus]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setPaymentStatus('idle');
      setSelectedTier(null);
      setPaymentError('');
      setTransactionCode('');
    }, 300);
  };

  const handlePayment = async () => {
    if (!selectedTier) return;

    setPaymentStatus('loading');
    setPaymentError('');

    try {
      const response = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_plan_id: selectedTier.id,
          payment_method: paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payment');
      }

      setTransactionCode(result.data?.transaction_code || '');
      setPaymentStatus('success');
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Terjadi kesalahan saat memproses pembayaran');
      setPaymentStatus('error');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Investasi untuk Bumi</h1>
        <p>Pilih paket langganan yang sesuai dengan kebutuhan pengelolaan sampah Anda.</p>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.sectionHeader}>
          <h2>Pilihan Paket Langganan</h2>
          <p>Sesuaikan dengan kebutuhan rumah atau bisnis Anda.</p>
        </div>
        <div className={styles.pricingGrid}>
          {/* 1. Paket Individu */}
          <div className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h3>Paket Individu</h3>
              <div className={styles.price}>
                Rp 49.000<span>/bulan</span>
              </div>
              <p className={styles.description}>Rumah tangga & pengguna personal</p>
            </div>
            <ul className={styles.features}>
              <li><span className={styles.check}>✓</span> Kuota sampah: 30 kg / bulan</li>
              <li><span className={styles.check}>✓</span> Pickup: 2x per minggu</li>
              <li><span className={styles.check}>✓</span> Jadwal pick up flexibel</li>
              <li><span className={styles.check}>✓</span> Multi lokasi</li>
              <li><span className={styles.check}>✓</span> Dashboard monitoring</li>
            </ul>
            <button
              onClick={() => handleCheckout('Paket Individu')}
              className={styles.ctaBtn}
            >
              Pilih Paket
            </button>
          </div>

          {/* 2. Paket Bisnis */}
          <div className={`${styles.pricingCard} ${styles.popular}`}>
            <div className={styles.popularBadge}>Best Value</div>
            <div className={styles.cardHeader}>
              <h3>Paket Bisnis</h3>
              <div className={styles.price}>
                Rp 299.000<span>/bulan</span>
              </div>
              <p className={styles.description}>UMKM, kantor, restoran, bisnis skala menengah</p>
            </div>
            <ul className={styles.features}>
              <li><span className={styles.check}>✓</span> Kuota sampah: 300 kg / bulan</li>
              <li><span className={styles.check}>✓</span> Pickup: 7x per minggu</li>
              <li><span className={styles.check}>✓</span> Jadwal pick up flexibel</li>
              <li><span className={styles.check}>✓</span> Multi lokasi outlet</li>
              <li><span className={styles.check}>✓</span> Dashboard monitoring</li>
            </ul>
            <button
              onClick={() => handleCheckout('Paket Bisnis')}
              className={styles.ctaBtn}
            >
              Pilih Paket
            </button>
          </div>

          {/* 3. Paket Event */}
          <div className={styles.pricingCard}>
            <div className={styles.popularBadge} style={{ background: '#2f5e44' }}>Custom</div>
            <div className={styles.cardHeader}>
              <h3>Paket Event</h3>
              <div className={styles.price} style={{ fontSize: '2rem' }}>
                Estimasi<span>/event</span>
              </div>
              <p className={styles.description}>Tidak menggunakan harga & kuota statis.</p>
            </div>
            <ul className={styles.features}>
              <li><span className={styles.check}>✓</span> Form Demo Estimasi Biaya</li>
              <li><span className={styles.check}>✓</span> Cocok untuk event apapun</li>
              <li><span className={styles.check}>✓</span> Tanpa kuota statis</li>
              <li><span className={styles.check}>✓</span> Opsi Branding & Support</li>
              <li><span className={styles.check}>✓</span> Jadwal pick up flexibel</li>
              <li><span className={styles.check}>✓</span> Multi lokasi</li>
              <li><span className={styles.check}>✓</span> Dashboard monitoring</li>
            </ul>
            <button
              onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={styles.ctaBtn}
              style={{ textAlign: 'center', width: '100%', cursor: 'pointer' }}
            >
              Hitung Estimasi
            </button>
          </div>
        </div>
      </section>

      {/* Event Calculator Section */}
      <section ref={calculatorRef} id="event-calculator">
        <EventCalculator />
      </section>

      <section className={styles.faqSection}>
        <div className={styles.detailsSection}>
          <div className={styles.sectionHeader}>
            <h2>Pertanyaan Umum</h2>
            <p>Punya pertanyaan? Temukan jawabannya di sini.</p>
          </div>
          <div className={styles.accordion}>
            {faqs.map((faq, idx) => (
              <div key={idx} className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  {faq.question}
                  <span>{openIndex === idx ? '−' : '+'}</span>
                </button>
                {openIndex === idx && <div className={styles.accordionBody}>{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {isModalOpen && selectedTier && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>

            {paymentStatus === 'success' ? (
              <div className={styles.successState}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    className={styles.successIcon}
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, heartbeat 2s infinite 1s'
                    }}
                  >
                    <svg className={styles.checkmarkSvg} viewBox="0 0 24 24">
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
                  Terima kasih telah berlangganan <strong>{selectedTier.name}</strong>.
                </p>
                {transactionCode && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', animation: 'fadeIn 0.5s ease 0.3s backwards' }}>
                    Kode Transaksi: <strong>{transactionCode}</strong>
                  </p>
                )}

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
                  className={styles.payBtn}
                  onClick={() => setIsModalOpen(false)}
                  style={{ marginTop: '1rem', animation: 'fadeIn 0.5s ease 0.5s backwards' }}
                >
                  Tutup
                </button>
              </div>
            ) : paymentStatus === 'error' ? (
              <div className={styles.successState}>
                <div className={styles.successIcon} style={{ backgroundColor: '#ED1C24' }}>✗</div>
                <h3>Gagal Memproses</h3>
                <p>{paymentError}</p>
                <button className={styles.payBtn} onClick={() => setPaymentStatus('idle')}>
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Pembayaran</h3>
                <div className={styles.summary} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: 'none' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedTier.name}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2f5e44' }}>{selectedTier.priceFormatted}</span>
                </div>

                <div className={styles.tabs}>
                  <button
                    className={`${styles.tabBtn} ${paymentMethod === 'bank' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                    disabled={paymentStatus === 'loading'}
                  >
                    Transfer Bank
                  </button>
                  <button
                    className={`${styles.tabBtn} ${paymentMethod === 'ewallet' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('ewallet')}
                    disabled={paymentStatus === 'loading'}
                  >
                    E-Wallet
                  </button>
                  <button
                    className={`${styles.tabBtn} ${paymentMethod === 'qris' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('qris')}
                    disabled={paymentStatus === 'loading'}
                  >
                    QRIS
                  </button>
                </div>

                <div className={styles.paymentContent}>
                  {paymentMethod === 'bank' && (
                    <div className={styles.bankInfo}>
                      <span className={styles.infoLabel}>Bank BCA (PT Silap Indonesia)</span>
                      <span className={styles.accountNumber}>8230 1234 5678</span>
                      <button className={styles.copyBtn} onClick={() => handleCopy('823012345678')}>
                        {copied ? 'Berhasil Disalin! ✓' : 'Salin No. Rek'}
                      </button>

                      <div className={styles.instructions} style={{ textAlign: 'left', marginTop: '1.5rem' }}>
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
                    <div className={styles.ewalletInfo}>
                      <span className={styles.infoLabel}>OVO / Gopay / Dana</span>
                      <span className={styles.accountNumber}>0812 3456 7890</span>
                      <button className={styles.copyBtn} onClick={() => handleCopy('081234567890')}>
                        {copied ? 'Berhasil Disalin! ✓' : 'Salin Nomor'}
                      </button>
                      <div className={styles.instructions} style={{ textAlign: 'left', marginTop: '1.5rem' }}>
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
                    <div className={styles.qrisPlaceholder}>
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
                  className={styles.payBtn}
                  onClick={handlePayment}
                  disabled={paymentStatus === 'loading' || !proofUploaded}
                  style={{
                    opacity: proofUploaded ? 1 : 0.5,
                    cursor: proofUploaded ? 'pointer' : 'not-allowed'
                  }}
                >
                  {paymentStatus === 'loading' ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}