'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './pricing.module.css';

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

  // Checkout & Payment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet' | 'qris'>('bank');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');
  const [transactionCode, setTransactionCode] = useState<string>('');

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
            period: '/bln',
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

  const handleCheckout = (tier: Tier) => {
    // Require login first
    if (sessionStatus !== 'authenticated') {
      router.push('/login');
      return;
    }

    setSelectedTier(tier);
    setPaymentStatus('idle');
    setPaymentMethod('bank');
    setPaymentError('');
    setTransactionCode('');
    setIsModalOpen(true);
  };

  useEffect(() => {
    const planName = searchParams.get('plan');
    if (planName && tiers.length > 0) {
      const tier = tiers.find(t => t.name.toLowerCase() === planName.toLowerCase());
      if (tier) {
        handleCheckout(tier);
      }
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
        <div className={styles.pricingGrid}>
          {isLoadingTiers ? (
            <p>Memuat paket...</p>
          ) : (
            tiers.map((tier) => (
              <div key={tier.id} className={`${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}>
                {tier.popular && <div className={styles.popularBadge}>Popular</div>}
                <div className={styles.cardHeader}>
                  <h3>{tier.name}</h3>
                  <div className={styles.price}>
                    {tier.priceFormatted}<span>{tier.period}</span>
                  </div>
                  <p className={styles.description}>{tier.desc}</p>
                </div>
                <ul className={styles.features}>
                  {tier.features.map((f) => (
                    <li key={f}><span className={styles.check}>✓</span> {f}</li>
                  ))}
                </ul>
                <button
                  className={styles.ctaBtn}
                  onClick={() => handleCheckout(tier)}
                >
                  Pilih Paket
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.detailsSection}>
          <h2>Pertanyaan Umum</h2>
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
                <div className={styles.successIcon}>✓</div>
                <h3>Pembayaran Dikirim!</h3>
                <p>
                  Terima kasih! Pembayaran Anda untuk paket <strong>{selectedTier.name}</strong> sedang
                  menunggu verifikasi admin.
                </p>
                {transactionCode && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Kode Transaksi: <strong>{transactionCode}</strong>
                  </p>
                )}
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                  Kami akan mengaktifkan langganan Anda setelah pembayaran diverifikasi.
                </p>
                <button className={styles.payBtn} onClick={() => router.push('/dashboard/profile')}>
                  Lihat Status
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
                <h3 className={styles.modalTitle}>Checkout: {selectedTier.name}</h3>

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
                      <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText('823012345678')}>
                        Salin No. Rek
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'ewallet' && (
                    <div className={styles.ewalletInfo}>
                      <span className={styles.infoLabel}>Nomor E-Wallet (OVO / GoPay / Dana)</span>
                      <span className={styles.accountNumber}>0812 3456 7890</span>
                      <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText('081234567890')}>
                        Salin Nomor
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'qris' && (
                    <div className={styles.qrisPlaceholder}>
                      <img src="/assets/qr-payment-dummy.svg" alt="QRIS" />
                      <small>Gunakan aplikasi mobile banking / E-Wallet</small>
                    </div>
                  )}

                  <div className={styles.instructions}>
                    <h4>Cara Pembayaran:</h4>
                    {paymentMethod === 'bank' && (
                      <ol>
                        <li>Buka aplikasi Mobile Banking atau ATM.</li>
                        <li>Pilih menu <strong>Transfer Antar Rekening</strong>.</li>
                        <li>Masukkan nomor rekening di atas.</li>
                        <li>Masukkan jumlah tagihan tepat hingga 3 digit terakhir.</li>
                        <li>Simpan bukti transfer untuk verifikasi.</li>
                      </ol>
                    )}
                    {paymentMethod === 'ewallet' && (
                      <ol>
                        <li>Buka aplikasi OVO, GoPay, atau Dana.</li>
                        <li>Pilih menu <strong>Transfer / Kirim</strong>.</li>
                        <li>Masukkan nomor tujuan di atas.</li>
                        <li>Pastikan nama penerima adalah <strong>Silap Indonesia</strong>.</li>
                        <li>Konfirmasi pembayaran dan simpan bukti transaksi.</li>
                      </ol>
                    )}
                    {paymentMethod === 'qris' && (
                      <ol>
                        <li>Buka aplikasi pembayaran apa saja (BCA, GoPay, OVO, dll).</li>
                        <li>Pilih menu <strong>Scan QRIS</strong>.</li>
                        <li>Arahkan kamera ke kode QR di atas.</li>
                        <li>Periksa nama merchant: <strong>Silap Indonesia</strong>.</li>
                        <li>Masukkan PIN dan pembayaran selesai otomatis.</li>
                      </ol>
                    )}
                  </div>
                </div>

                <div className={styles.summary}>
                  <span>Total Tagihan</span>
                  <span className={styles.totalPrice}>{selectedTier.priceFormatted}</span>
                </div>

                <button
                  className={styles.payBtn}
                  onClick={handlePayment}
                  disabled={paymentStatus === 'loading'}
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