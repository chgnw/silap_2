'use client';

import { useState, useMemo } from 'react';
import styles from './EventCalculator.module.css';

const EVENT_TYPES = [
    { value: 'konser', label: 'Konser Musik' },
    { value: 'festival', label: 'Festival Makanan / Seni' },
    { value: 'pameran', label: 'Pameran / Expo' },
    { value: 'seminar', label: 'Seminar / Conference' },
    { value: 'lainnya', label: 'Lainnya' },
];

const PICKUP_FREQ = [
    { value: 1, label: '1x per hari' },
    { value: 2, label: '2x per hari' },
    { value: 0, label: 'On-demand (Sesuai panggilan)' }, // logic khusus
];

export default function EventCalculator() {
    const [eventType, setEventType] = useState('konser');
    const [participants, setParticipants] = useState<number>(500);
    const [duration, setDuration] = useState<number>(1);
    const [bins, setBins] = useState<number>(5);
    const [pickupFreq, setPickupFreq] = useState<number>(1);
    const [addOns, setAddOns] = useState({
        branding: false,
        support: false,
    });

    // Calculation Logic
    const estimates = useMemo(() => {
        // 1. Waste Estimation (avg 0.6kg per person/day)
        // Adjust multiplier based on event type if needed
        const wasteMultiplier = 0.6;
        const totalWaste = Math.round(participants * duration * wasteMultiplier);

        // 2. Pickup Estimation
        let totalPickups = 0;
        if (pickupFreq === 0) {
            // On-demand assumption: 1 pickup per 500kg waste
            totalPickups = Math.max(1, Math.ceil(totalWaste / 500));
        } else {
            totalPickups = pickupFreq * duration;
        }

        // 3. Cost Estimation (Constants)
        const COST_PER_KG = 1500;
        const COST_PER_PICKUP = 300000;
        const COST_BRANDING = 1500000;
        const COST_SUPPORT_DAY = 750000;

        let baseCost = (totalWaste * COST_PER_KG) + (totalPickups * COST_PER_PICKUP);

        // Add-ons
        if (addOns.branding) baseCost += COST_BRANDING;
        if (addOns.support) baseCost += (COST_SUPPORT_DAY * duration);

        // Create a range for "Estimation" (e.g., +/- 10%)
        const minCost = Math.round(baseCost * 0.9);
        const maxCost = Math.round(baseCost * 1.1);

        return {
            totalWaste,
            totalPickups,
            minCost,
            maxCost,
        };
    }, [participants, duration, pickupFreq, addOns, eventType]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2>Paket Event Custom</h2>
                <p>Solusi manajemen sampah fleksibel untuk acara Anda. Hitung estimasi biaya di sini.</p>
            </div>

            <div className={styles.calculatorContainer}>
                {/* Form Side */}
                <div className={styles.formSide}>
                    <div className={styles.formGroup}>
                        <label>Jenis Event</label>
                        <select
                            className={styles.select}
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                        >
                            {EVENT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Estimasi Peserta</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={participants}
                                onChange={(e) => setParticipants(Number(e.target.value))}
                                min={10}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Durasi (Hari)</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                min={1}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Jumlah Titik Sampah</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={bins}
                                onChange={(e) => setBins(Number(e.target.value))}
                                min={1}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Frekuensi Pickup</label>
                            <select
                                className={styles.select}
                                value={pickupFreq}
                                onChange={(e) => setPickupFreq(Number(e.target.value))}
                            >
                                {PICKUP_FREQ.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={addOns.branding}
                                onChange={(e) => setAddOns({ ...addOns, branding: e.target.checked })}
                            />
                            <div>
                                <span style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '0.2rem' }}>Branding Event</span>
                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Stiker tong sampah & banner edukasi</span>
                            </div>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={addOns.support}
                                onChange={(e) => setAddOns({ ...addOns, support: e.target.checked })}
                            />
                            <div>
                                <span style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '0.2rem' }}>On-site Support</span>
                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Tim kebersihan standby di lokasi</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Result Side */}
                <div className={styles.resultSide}>
                    <div className={styles.resultTitle}>Estimasi Kebutuhan</div>

                    <div className={styles.statGrid}>
                        <div className={styles.statItem}>
                            <h4>Total Sampah</h4>
                            <div className={styles.statValue}>{estimates.totalWaste} kg</div>
                        </div>
                        <div className={styles.statItem}>
                            <h4>Pickup Trip</h4>
                            <div className={styles.statValue}>{estimates.totalPickups}x</div>
                        </div>
                    </div>

                    <div className={styles.totalCost}>
                        <span>Estimasi Biaya Total</span>
                        <div className={styles.costValue}>
                            {formatCurrency(estimates.minCost)} - {formatCurrency(estimates.maxCost)}
                        </div>
                        <div className={styles.disclaimer}>
                            *Harga final akan dikonfirmasi oleh tim SILAP setelah survei lokasi.
                        </div>
                    </div>

                    <div className={styles.buttons}>
                        <button
                            className={styles.btnPrimary}
                            style={{ backgroundColor: '#A4B465', borderColor: '#A4B465', color: 'white' }}
                            onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                        >
                            Hubungi WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
