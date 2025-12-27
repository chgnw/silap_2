"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./error-page.module.css";

interface ErrorPageProps {
    statusCode: number;
    title?: string;
    message?: string;
    reset?: () => void;
    traceId?: string;
}

const errorConfig: Record<
    number,
    { defaultTitle: string; defaultMessage: string; icon: React.ReactNode }
> = {
    400: {
        defaultTitle: "Bad Request",
        defaultMessage: "Data yang Anda kirim tidak sesuai. Coba cek kembali.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 9V14M12 17.01L12.01 16.998M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    401: {
        defaultTitle: "Unauthorized",
        defaultMessage: "Sesi Anda habis. Silakan login kembali.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M5 10.5H19C20.1046 10.5 21 11.3954 21 12.5V20.5C21 21.6046 20.1046 22.5 19 22.5H5C3.89543 22.5 3 21.6046 3 20.5V12.5C3 11.3954 3.89543 10.5 5 10.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M12 16.5V16.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    403: {
        defaultTitle: "Access Denied",
        defaultMessage: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M9 12H15M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M5.63605 5.63604L18.364 18.364" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    404: {
        defaultTitle: "Page Not Found",
        defaultMessage: "Halaman yang Anda cari sudah pindah atau tidak tersedia.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M21 21L16.65 16.65M16.65 16.65C16.3988 16.9014 16.126 17.1276 15.8341 17.3276M16.65 16.65C18.4329 14.8671 19.3243 12.7126 19.3243 10.4121C19.3243 5.49479 15.3385 1.50898 10.4212 1.50898C5.50384 1.50898 1.51805 5.49479 1.51805 10.4121C1.51805 15.3295 5.50384 19.3153 10.4212 19.3153C12.7217 19.3153 14.8762 18.4239 16.6591 16.641M11.9052 7.4442L8.93719 10.4121M8.93719 10.4121L5.96919 13.3801M8.93719 10.4121L5.96919 7.4442M8.93719 10.4121L11.9052 13.3801"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    422: {
        defaultTitle: "Validation Error",
        defaultMessage: "Ada beberapa isian yang belum benar. Periksa kembali.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    500: {
        defaultTitle: "Internal Server Error",
        defaultMessage: "Terjadi kesalahan sistem. Tim kami sedang memperbaikinya.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 8V12M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    503: {
        defaultTitle: "Under Maintenance",
        defaultMessage: "SILAP sedang dalam pemeliharaan rutin. Kami akan segera kembali.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M19.0001 5H4.99996C3.89539 5 2.99996 5.89543 2.99997 7V19C2.99998 20.1046 3.89541 21 5.00001 21H19.0001C20.1047 21 21.0001 20.1046 21.0001 19V7C21.0001 5.89543 20.1047 5 19.0001 5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M7 5V3M17 5V3M7 21V23M17 21V23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 11H21M3 15H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    504: {
        defaultTitle: "Gateway Timeout",
        defaultMessage: "Server butuh waktu terlalu lama. Silakan coba lagi nanti.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
};

const ErrorPage: React.FC<ErrorPageProps> = ({
    statusCode,
    title,
    message,
    reset,
    traceId,
}) => {
    const router = useRouter();

    // Determine configuration based on status code
    // Default to 500 if unknown
    const config = errorConfig[statusCode] || errorConfig[500];

    const displayTitle = title || config.defaultTitle;
    const displayMessage = message || config.defaultMessage;

    useEffect(() => {
        // Optional: Log error to console service like Sentry here
        if (statusCode >= 500) {
            console.error(
                `Critical Error | Code: ${statusCode} | Trace: ${traceId || "N/A"}`
            );
        }
    }, [statusCode, traceId]);

    return (
        <div className={styles.container}>
            {/* Decorative Blobs */}
            <div className={`${styles.blob} ${styles.blob1}`} />
            <div className={`${styles.blob} ${styles.blob2}`} />

            <div className={styles.content}>
                <div className={styles.illustrationWrapper}>
                    <span className={styles.errorCode}>{statusCode}</span>
                    <div className={styles.iconContainer}>
                        {config.icon}
                    </div>
                </div>

                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{displayTitle}</h1>
                    <p className={styles.message}>{displayMessage}</p>

                    {traceId && (
                        <div className={styles.traceId}>
                            <span>Error Trace ID</span>
                            <code>{traceId}</code>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {reset && (
                        <button onClick={reset} className={`${styles.button} ${styles.buttonPrimary}`}>
                            Coba Lagi
                        </button>
                    )}

                    <button
                        onClick={() => router.back()}
                        className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                        Kembali
                    </button>

                    <Link href="/" passHref legacyBehavior>
                        <a className={`${styles.button} ${styles.buttonSecondary}`}>
                            Ke Beranda
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
