"use client";

import ErrorPage from "@/app/components/Large/ErrorPage/ErrorPage";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "900"],
    variable: "--font-montserrat",
});

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${montserrat.className}`}>
                <ErrorPage statusCode={500} reset={reset} traceId={error.digest} />
            </body>
        </html>
    );
}
