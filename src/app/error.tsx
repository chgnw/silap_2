"use client";

import { useEffect } from "react";
import ErrorPage from "@/app/components/Large/ErrorPage/ErrorPage";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return <ErrorPage statusCode={500} reset={reset} traceId={error.digest} />;
}
