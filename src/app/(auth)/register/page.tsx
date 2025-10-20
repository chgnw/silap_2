"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import styles from '../auth.module.css';

function RoleSelection({ onSelectRole }: { onSelectRole: (role: 'customer' | 'mitra') => void }) {
  return (
    <div className={styles.card}>
        <h2 className="text-center mb-4">Yuk, Buat Akunmu</h2>
        <p className="text-center mb-4">Pilih jenis akun yang ingin kamu buat</p>
        <Row>
            <Col>
                <div className="text-center p-3 border rounded" onClick={() => onSelectRole('customer')} style={{cursor: 'pointer'}}>
                    {/* Ganti dengan gambar yang sesuai */}
                    <p className="mt-2 mb-0">Customer</p>
                </div>
            </Col>
            <Col>
                <div className="text-center p-3 border rounded" onClick={() => onSelectRole('mitra')} style={{cursor: 'pointer'}}>
                    {/* Ganti dengan gambar yang sesuai */}
                    <p className="mt-2 mb-0">Mitra</p>
                </div>
            </Col>
        </Row>
         <p className="mt-4 text-center">Sudah punya akun? <a href="/login">Masuk</a></p>
    </div>
  );
}


// Komponen untuk formulir pendaftaran
function RegisterForm({ role }: { role: 'customer' | 'mitra' }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
        setError("Kata sandi tidak cocok!");
        return;
        }
        setError(null);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                    phone_number: phoneNumber,
                    role,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Gagal mendaftar');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.card}>
            <h2 className="mb-4">Daftar sebagai {role === 'customer' ? 'Customer' : 'Mitra'}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nama Lengkap*</Form.Label>
                    <Form.Control type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email*</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Nomor Telepon*</Form.Label>
                    <Form.Control type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Kata Sandi*</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tulis Ulang Kata Sandi*</Form.Label>
                    <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </Form.Group>
                <Button type="submit" className={styles.submit}>Daftar</Button>
            </Form>
        </div>
    );
}

export default function RegisterPage() {
    const [step, setStep] = useState<'selection' | 'form'>('selection');
    const [role, setRole] = useState<'customer' | 'mitra' | null>(null);

    const handleRoleSelect = (selectedRole: 'customer' | 'mitra') => {
        setRole(selectedRole);
        setStep('form');
    };

    if (step === 'selection') {
        return <RoleSelection onSelectRole={handleRoleSelect} />;
    }

    if (step === 'form' && role) {
        return <RegisterForm role={role} />;
    }
    
    return null;
}