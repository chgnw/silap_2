"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../auth.module.css';

import FullPageSpinner from "../../components/Large/Spinner/Spinner";

function RoleSelection({ onSelectRole }: { onSelectRole: (role: 'customer' | 'mitra') => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.registerCard}>
        <p className={styles.leftSub} style={{ textAlign: 'left'}}>Hola,</p>
        <h2 style={{ fontSize: '5.5rem',  textAlign: 'left'}}>Selamat Datang</h2>
        
        <div className={styles.roleSelection}>
          <div className={styles.roleCard} onClick={() => onSelectRole('customer')}>
            <img src="/images/customer.svg" alt="Customer" />
            <div className={styles.roleLabel}>Customer</div>
          </div>
          
          <div className={styles.roleCard} onClick={() => onSelectRole('mitra')}>
            <img src="/images/mitra.svg" alt="Mitra" />
            <div className={styles.roleLabel}>Mitra</div>
          </div>
        </div>
        
        <p className={styles.footerRegister}>
          Sudah punya akun?{" "}
          <a href="/login" className={styles.linkRegister}>
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
}

function RegisterForm({ role }: { role: 'customer' | 'mitra' }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    setError(null);
    setLoading(true); // 🌀 start spinner

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone_number: phoneNumber,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');

      // 🚀 Step 2: Auto-login via NextAuth
      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.error) {
        setError("Login otomatis gagal, silakan login manual.");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.registerFormCard}>
          <h2>Daftar sebagai {role === 'customer' ? 'Customer' : 'Mitra'}</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formCol}>
                <div className={styles.formGroup}>
                  <label>Nama Depan *</label>
                  <input
                    type="text"
                    placeholder="Javier"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formCol}>
                <div className={styles.formGroup}>
                  <label>Nama Belakang *</label>
                  <input
                    type="text"
                    placeholder="Adios"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Nomor Telepon *</label>
              <input
                type="tel"
                placeholder="0822 1212 3422"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email*</label>
              <input
                type="email"
                placeholder="javierpansyolo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Kata Sandi *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tulis Ulang Kata Sandi *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className={styles.alert}>{error}</div>}

            <button
              type="submit"
              className={styles.registerSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                "Daftar →"
              )}
            </button>
          </form>

          <p className={styles.footer}>
            Sudah punya akun?{" "}
            <a href="/login" className={styles.link}>
              Masuk
            </a>
          </p>
        </div>

        <div className={styles.registerRight}>
          <p className={styles.subtitle}>Yuk,</p>
          <h1>
            Buat<br />Akunmu
          </h1>
          <div className={styles.roleImage}>
            <img src="/images/create-account.svg" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<'selection' | 'form'>('selection');
  const [role, setRole] = useState<'customer' | 'mitra' | null>(null);

  const handleRoleSelect = (selectedRole: 'customer' | 'mitra') => {
    setRole(selectedRole);
    setStep('form');
  };

  if (step === 'selection') return <RoleSelection onSelectRole={handleRoleSelect} />;
  if (step === 'form' && role) return <RegisterForm role={role} />;
  return null;
}