"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../auth.module.css';

function RoleSelection({ onSelectRole }: { onSelectRole: (role: 'customer' | 'mitra') => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.registerCard}>
        <p>Hola,</p>
        <h2>Selamat Datang</h2>
        
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
        
        <div className={styles.registerFooter}>
          Sudah punya akun?{" "}
          <a href="/login" className={styles.linkRegister}>
            Masuk
          </a>
        </div>
      </div>
    </div>
  );
}

function RegisterForm({ role, onBackToSelection }: { 
  role: 'customer' | 'mitra',
  onBackToSelection: () => void 
}) {
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
    setLoading(true);

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

      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.error) {
        setError("Login otomatis gagal, silakan login manual.");
      } else {
        router.push('/dashboard');
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
          <form onSubmit={handleSubmit} className={styles.formGroup}>
            <div className={styles.formRow}>
              <div className={styles.formCol}>
                <div className={styles.formContainer}>
                  <label className={styles.formLabel}>
                    Nama Depan <span className={styles.requiredField}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formCol}>
                <div className={styles.formGroup}>
                  <div className={styles.formContainer}>
                    <label className={styles.formLabel}>
                      Nama Belakang <span className={styles.requiredField}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formContainer}>
              <label className={styles.formLabel}>
                Nomor Telepon <span className={styles.requiredField}>*</span>
              </label>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formContainer}>
              <label className={styles.formLabel}>
                Email <span className={styles.requiredField}>*</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formContainer}>
              <label className={styles.formLabel}>
                Kata Sandi <span className={styles.requiredField}>*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formContainer}>
              <label className={styles.formLabel}>
                Tulis Ulang Kata Sandi <span className={styles.requiredField}>*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>

            {error && <div className={styles.alert}>{error}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                "Daftar →"
              )}
            </button>

            <p className={styles.footer}>
              Sudah punya akun?{" "}
              <a href="/login" className={styles.link}>
                Masuk
              </a>
            </p>
          </form>
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

  const handleBackToSelection = () => {
    setStep('selection');
    setRole(null);
  };

  if (step === 'selection') return <RoleSelection onSelectRole={handleRoleSelect} />;
  if (step === 'form' && role) return <RegisterForm role={role} onBackToSelection={handleBackToSelection} />;
  
  return null;
}