"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../auth.module.css';

import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const [countryCode, setCountryCode] = useState('+62'); 
  const [countryOptions, setCountryOptions] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Fetch data kode telepon tiap negara 
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
        const data = await res.json();

        const formattedCountries = data
          .filter((country: any) => country.idd?.root)
          .map((country: any) => {
            const code = `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ''}`;
            
            return {
              name: country.name.common,
              code: code,
              flag: country.cca2
            };
          })
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountryOptions(formattedCountries);
        
        const indonesia = formattedCountries.find((c: any) => c.name === 'Indonesia');
        if(indonesia) setCountryCode(indonesia.code);

      } catch (error) {
        console.error("Gagal ambil data negara:", error);
        setCountryOptions([
            { name: 'Indonesia', code: '+62' }
        ] as any);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, '');

    if (val.startsWith('0')) {
      val = val.substring(1);
    }

    const codeNumber = countryCode.replace('+', '');
    if (val.startsWith(codeNumber)) {
      val = val.substring(codeNumber.length);
    }

    setPhoneNumber(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    if (phoneNumber.length < 9 || phoneNumber.length > 15) {
      setError("Nomor telepon tidak valid (minimal 9 angka).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid!");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter!");
      return;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError("Kata sandi harus mengandung minimal 1 huruf kapital!");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Kata sandi harus mengandung minimal 1 karakter spesial!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setError(null);
    setLoading(true);

    const fullPhoneNumber = `${countryCode} ${phoneNumber}`;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone_number: fullPhoneNumber,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');

      await new Promise(r => setTimeout(r, 500));

      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      console.log("login result: ", loginResult);

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
              <div style={{ display: 'flex', gap: '10px' }}>
                  <div 
                    className={styles.formInput}
                    style={{ 
                      position: 'relative', 
                      width: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ pointerEvents: 'none', fontWeight: 'medium', color: '#000000' }}>
                      {countryCode}
                    </span>
                    
                    <span style={{ fontSize: '10px', marginLeft: '4px', pointerEvents: 'none' }}>▼</span>

                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={isLoadingCountries}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    >
                      {isLoadingCountries ? (
                        <option>Loading...</option>
                      ) : (
                        countryOptions.map((option: any, index) => (
                          <option key={index} value={option.code}>
                            {option.name} ({option.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    required
                    className={styles.formInput}
                    style={{ flexGrow: 1 }}
                  />
              </div>
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
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.formInput}
                />
                {showPassword ? (
                  <FaEyeSlash className={styles.eyeIcon} onClick={() => setShowPassword(false)} />
                ) : (
                  <FaEye className={styles.eyeIcon} onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            <div className={styles.formContainer}>
              <label className={styles.formLabel}>
                Tulis Ulang Kata Sandi <span className={styles.requiredField}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={styles.formInput}
                />
                {showConfirm ? (
                  <FaEyeSlash className={styles.eyeIcon} onClick={() => setShowConfirm(false)} />
                ) : (
                  <FaEye className={styles.eyeIcon} onClick={() => setShowConfirm(true)} />
                )}
              </div>
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