"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Form, Button, Alert } from 'react-bootstrap';
import styles from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
        const result = await signIn('credentials', {
            redirect: false,
            email: email,
            password: password,
        });

        if (result?.error) {
            setError('Email atau password salah. Silakan coba lagi.');
        } else if (result?.ok) {
            router.push('/');
            router.refresh(); 
        }
        } catch (err) {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    return (
        <div className={styles.card}>
            <h2>Login</h2>
            <p>Masuk ke akunmu untuk mengakses fitur SILAP lebih lengkap</p>
            
            {/* Tombol Login Google */}
            <Button 
                variant="light" 
                className="w-100 mb-3 border" 
                onClick={() => signIn('google', { callbackUrl: '/' })}>
                Login dengan Google
            </Button>

            <hr />

            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </Form.Group>

                <Form.Group controlId="formPassword"  className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </Form.Group>

                <Button variant="primary" type="submit" className={`${styles.submit} mt-4`}>
                    Masuk dengan Email
                </Button>
            </Form>
            <p className="mt-3 text-center">
                Belum punya akun? <a href="/register">Daftar Akun</a>
            </p>
        </div>
    );
}