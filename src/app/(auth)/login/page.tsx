"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

import FullPageSpinner from "../../components/Large/Spinner/Spinner";

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if(result?.error) {
        setError("Login gagal, silakan coba lagi.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        console.log("User session:", session);
    
        if (session?.user?.role_id == 3) {
          router.push("/admin");
        } else if (session?.user?.role_id == 2) {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
    
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }

  };

  if (showEmailForm) {
    return (      
      <>
        <div className={styles.page}>
          <div className={styles.left}>
            <div className={styles.leftContent}>
              <p className={styles.leftSub}>Yuk,</p>
              <h1 className={styles.leftTitle}>LOGIN</h1>
              <p className={styles.leftDesc}>
                Masuk ke akunmu untuk mengakses fitur SILAP lebih lengkap
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <button 
              className={styles.closeBtn}
              onClick={() => setShowEmailForm(false)}
            >
              ×
            </button>
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '0.4rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#333', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className={styles.registerSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  "Masuk →"
                )}
              </button>
            </form>

            <p className={styles.footer}>
              Belum punya akun?{" "}
              <a href="/register" className={styles.link}>
                Daftar Akun
              </a>
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <p className={styles.leftSub}>Yuk,</p>
            <h1 className={styles.leftTitle}>LOGIN</h1>
            <p className={styles.leftDesc}>
              Masuk ke akunmu untuk mengakses fitur SILAP lebih lengkap
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <button
            className={styles.googleBtn}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <img src="/icons/google.png" alt="Google" />
            Login dengan Google
          </button>

          <button
            className={styles.emailBtn}
            onClick={() => setShowEmailForm(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M19 6l-9 6-9-6" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            Masuk dengan Email
          </button>

          <p className={styles.footer}>
            Belum punya akun?{" "}
            <a href="/register" className={styles.link}>
              Daftar Akun
            </a>
          </p>
        </div>
      </div>
    </>
  );
}