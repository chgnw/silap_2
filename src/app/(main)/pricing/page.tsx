'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './pricing.module.css';

interface Tier {
  name: string;
  price: string;
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);


  // Checkout & Payment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'ewallet' | 'qris'>('bank');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const tiers: Tier[] = [
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

  const faqs: FAQ[] = [
    { question: 'Apakah harga sudah termasuk PPN?', answer: 'Ya, harga yang tertera sudah termasuk PPN 11%.' },
    { question: 'Bisa berhenti berlangganan kapan saja?', answer: 'Tentu. Anda bisa membatalkan langganan kapan saja tanpa biaya penalti melalui aplikasi.' },
    { question: 'Metode pembayaran apa yang tersedia?', answer: 'Kami menerima transfer bank (BCA, Mandiri, BNI), E-Wallet (GoPay, OVO, Dana), dan QRIS.' },
    { question: 'Bagaimana jika sampah melebihi kapasitas?', answer: 'Anda akan dikenakan biaya tambahan per kg sesuai tarif yang berlaku, atau Anda bisa upgrade paket.' },
  ];

  const handleCheckout = (tier: Tier) => {
    setSelectedTier(tier);
    setPaymentStatus('idle');
    setPaymentMethod('bank');
    setIsModalOpen(true);
  };

  useEffect(() => {
    const planName = searchParams.get('plan');
    if (planName) {
      const tier = tiers.find(t => t.name.toLowerCase() === planName.toLowerCase());
      if (tier) {
        handleCheckout(tier);
      }
    }
  }, [searchParams]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setPaymentStatus('idle');
      setSelectedTier(null);
    }, 300);
  };

  const handlePayment = () => {
    setPaymentStatus('loading');

    // Simulate payment process
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2000);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Investasi untuk Bumi</h1>
        <p>Pilih paket langganan yang sesuai dengan kebutuhan pengelolaan sampah Anda.</p>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.pricingGrid}>
          {tiers.map((tier) => (
            <div key={tier.name} className={`${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}>
              {tier.popular && <div className={styles.popularBadge}>Popular</div>}
              <div className={styles.cardHeader}>
                <h3>{tier.name}</h3>
                <div className={styles.price}>
                  {tier.price}<span>{tier.period}</span>
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
          ))}
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
                <h3>Pembayaran Berhasil!</h3>
                <p>Terima kasih telah berlangganan paket {selectedTier.name}. Layanan Anda telah aktif.</p>
                <button className={styles.payBtn} onClick={closeModal}>Tutup</button>
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
                      <span>Scan QRIS</span>
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
                  <span className={styles.totalPrice}>{selectedTier.price}</span>
                </div>

                <button
                  className={styles.payBtn}
                  onClick={handlePayment}
                  disabled={paymentStatus === 'loading'}
                >
                  {paymentStatus === 'loading' ? 'Memproses...' : 'Bayar Sekarang'}
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