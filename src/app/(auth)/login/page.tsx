"use client";

import { signIn } from "next-auth/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [step, setStep] = useState<"method" | "login" | "forgot" | "otp" | "reset">("method");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const fadeSlide = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.25, ease: "easeOut" as const } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { duration: 0.2, ease: "easeIn" as const } 
    },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    console.log(email, password);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      console.log(result);

      if (result?.error) {
        setError("Login gagal, silakan coba lagi.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role_id === 3) router.push("/admin");
        else if (session?.user?.role_id === 2) router.push("/dashboard");
        else router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulasi aja belom beneran
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: ganti dengan call ke /api/auth/send-otp
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setError(null);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const otp = otpRef.current?.value || "";
    
    // TODO: call ke /api/auth/verify-otp
    setTimeout(() => {
      if (otp === "123456") {
        setStep("reset");
        setError(null);
      } else {
        setError("OTP salah atau sudah kadaluarsa.");
      }
      setLoading(false);
    }, 800);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }
    
    setLoading(true);
    setError(null);
    // TODO: call ke /api/auth/reset-password
    setTimeout(() => {
      setStep("method");
      setError(null);

      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
      if (otpRef.current) otpRef.current.value = "";
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`${styles.page} ${
      step === "forgot" || step === "otp" || step === "reset" ? styles.centered : ""
    }`}>
      {/* LEFT PANEL */}
      <AnimatePresence mode="wait">
        {(step === "method" || step === "login") && (
          <motion.div
            key="left-panel"
            className={styles.left}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
          >
            <div className={styles.leftContent}>
              <span className={styles.leftSub}>Yuk,</span>
              <h1 className={styles.leftTitle}>LOGIN</h1>
              <span className={styles.leftDesc}>
                Masuk ke akunmu untuk mengakses fitur SILAP lebih lengkap
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT PANEL */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          className={styles.card}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
          {step === "method" && (
            <motion.div key="method" {...fadeSlide} className="w-100">
              <div className={styles.buttonContainer} style={{ marginBottom: '1rem' }}>
                <button className={styles.googleBtn} onClick={() => signIn("google", { callbackUrl: "/" })}>
                  <img src="/icons/google-icon.svg" alt="Google" />
                  Login dengan Google
                </button>

                <button className={styles.emailBtn} onClick={() => setStep("login")}>
                  <MdEmail size={24}/>
                  Masuk dengan Email
                </button>
              </div>

              <p className={styles.footer}>
                Belum punya akun?{" "}
                <a href="/register" className={styles.link}>
                  Daftar Akun
                </a>
              </p>
            </motion.div>
          )}

          {step === "login" && (
            <motion.div key="login" {...fadeSlide} className="w-100">
              <button className={styles.closeBtn} onClick={() => {
                setStep("method")
                setError(null)
              }}>
                ×
              </button>

              <form onSubmit={handleLogin} className={styles.formGroup}>
                {/* Email Form */}
                <div className={styles.formContainer}>
                  <label className={styles.formLabel}>
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder="Email"
                    autoComplete="email"
                    className={styles.formInput}
                  />
                </div>
                
                {/* Password Form */}
                <div className={styles.formContainer}>
                  <label className={styles.formLabel}>
                    Password
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      autoComplete="current-password"
                      className={styles.formInput}
                    />
                    {showPassword ? (
                      <FaEyeSlash className={styles.eyeIcon} onClick={() => setShowPassword(false)} />
                    ) : (
                      <FaEye className={styles.eyeIcon} onClick={() => setShowPassword(true)} />
                    )}
                  </div>
                </div>

                {/* Login Condition */}
                <div className={styles.loginCondition}>
                  <div className={styles.rememberMe}>
                    <input type="checkbox" id="rememberMeCheckbox" />
                    <label htmlFor="rememberMeCheckbox" className={styles.rememberMeLabel}>Remember me</label>
                  </div>

                  <button type="button" className={styles.forgotPassword} onClick={() => {
                    setStep("forgot")
                    setError(null)  
                  }}>
                    Forgot Password?
                  </button>
                </div>
                
                {/* Error Message */}
                {error && <div className={styles.alert}>{error}</div>}
                
                {/* Submit Button */}
                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <div className={styles.spinner}></div> : "Sign In"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Forgot Password */}
          {step === "forgot" && (
            <motion.div key="forgot" {...fadeSlide} className="w-100">
              <button className={styles.closeBtn} onClick={() => {
                setStep("login")
                setError(null)  
              }}>
                ×
              </button>

              <div className={styles.headerContainer}>
                <h2>Lupa Password?</h2>
              </div>

              <form onSubmit={handleSendOtp} className={styles.formGroup}>
                <div className={styles.formContainer}>
                  <label className={styles.formLabel}>
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder="Email"
                    autoComplete="email"
                    className={styles.formInput}
                  />
                </div>

                <p className={styles.smallText}>
                  Kami akan mengirimkan kode verifikasi ke email ini jika cocok dengan akun SILAP yang ada.
                </p>

                {error && <div className={styles.alert}>{error}</div>}

                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <div className={styles.spinner}></div> : "Next"}
                  </button>
                  
                  <button type="button" className={styles.backButton} onClick={() => {
                    setStep("method")
                    setError(null)
                  }}>
                    Back
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* State OTP */}
          {step === "otp" && (
            <motion.div key="otp" {...fadeSlide} className="w-100">
              <button className={styles.closeBtn} onClick={() => {
                setStep("method")
                setError(null)  
              }}>
                ×
              </button>

              <div className={styles.headerContainer}>
                <h2>Enter The 6-Digit Code</h2>
                <p className={styles.smallText}>
                  Silahkan cek email untuk mendapatkan kode OTP
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className={styles.formGroup}>
                <div className={styles.formContainer}>
                  <input
                    ref={otpRef}
                    type="text"
                    required
                    placeholder="6-Digit Code"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className={styles.formInput}
                  />
                </div>

                <div style={{ width: '100%' }}>
                  <button type="button" className={styles.resendButton}>
                    Resend code
                  </button>
                </div>
                
                {error && <div className={styles.alert}>{error}</div>}

                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? <div className={styles.spinner}></div> : "Submit"}
                  </button>
                </div>

                <p className={styles.smallText}>
                  Jika kamu tidak melihat email di inbox, periksa folder spam. Jika tidak ada, alamat email mungkin tidak terkonfirmasi, atau mungkin tidak cocok dengan akun SILAP yang ada.
                </p>
              </form>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div key="reset" {...fadeSlide} className="w-100">
              <button className={styles.closeBtn} onClick={() => {
                setStep("method")
                setError(null)  
              }}>
                ×
              </button>

              <div className={styles.headerContainer}>
                <h2>Kata Sandi Baru</h2>
                <p className={styles.smallText}>
                  Untuk mengamankan akun kamu, pilih kata sandi yang kuat belum pernah menggunakan sebelumnya dan setidaknya terdiri dari 8 karakter panjang.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className={styles.formGroup}>
                <div className={styles.formContainer}>
                  {/* New password */}
                  <div className={styles.passwordWrapper}>
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Kata Sandi Baru"
                      autoComplete="new-password"
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
                  {/* Confirm password */}
                  <div className={styles.passwordWrapper}>
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="Ketik Ulang Kata Sandi Baru"
                      autoComplete="new-password"
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
                
                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitButton} disabled={loading} style={{ margin: '0' }}>
                    {loading ? <div className={styles.spinner}></div> : "Save Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}