"use client";

import ErrorPage from "@/app/components/Large/ErrorPage/ErrorPage";

export default function NotFound() {
    return <ErrorPage statusCode={404} />;
}
