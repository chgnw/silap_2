import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Layanan SILAP - Jadi Pahlawan Lingkungan',
    description: 'Layanan penjemputan sampah terpilah mudah dan berhadiah.',
};

export default function ServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}