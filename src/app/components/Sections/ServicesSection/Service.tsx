import { Container, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import ServiceCard from '../../Medium/ServiceCard/ServiceCard';
import ServiceGroup from '../../Large/ServiceGroup/ServiceGroup';
import styles from './Service.module.css';

// Data untuk kategori "Untuk Semua Orang"
const servicesForEveryone = [
    {
        icon: <Image src="/assets/pickup-icon.png" alt="Pick Up" width={24} height={24} />,
        title: 'Pick Up',
        description: 'Tinggal foto sampahmu, upload ke aplikasi, dan tim kolektor kami akan datang menemput. Nggak cuma diambil, sampahmu juga akan ditimbang dan dikelola dengan benar. Jadi kamu gak perlu keluar rumah.'
    },

    {
        icon: <Image src="/assets/streak-icon.png" alt="Streak" width={24} height={24} />,
        title: 'Streak',
        description: "Setiap kali kamu kelola sampah dengan baik, kamu dapet streak. Semakin konsisten, semakin banyak manfaat dan poin yang bisa kamu kumpulin. It's like a daily mission to save the planet dan kamu pahlawannya!"
    }
];

// Data untuk kategori "Untuk Perusahaan"
const servicesForCompanies = [
    {
        icon: <Image src="/assets/business-icon.png" alt="Business" width={24} height={24} />,
        title: 'Business',
        description: 'Bangun kantor yang peduli lingkungan tanpa harus keluar biaya besar. Layanan berlangganan daur ulang dari SILAP siap bantu kamu untuk mengelola sampah dengan mudah, terjadwal, dan terukur.'
    },
    {
        icon: <Image src="/assets/corporate-icon.png" alt="Corporate" width={24} height={24} />,
        title: 'Corporate & Brand',
        description: 'Kami hadir untuk bantu brand kamu lebih bertanggung jawab. Teknologi SILAP membantu perusahaan mengumpulkan kembali produk pasca-konsumsi untuk didaur ulang dari kemasan plastik hingga barang elektronik.'
    },
    {
        icon: <Image src="/assets/event-icon.png" alt="Event" width={24} height={24} />,
        title: 'Event',
        description: 'Daftarin event kamu di SILAP dan kami akan siapkan layanan daur ulang khusus yang fleksibel dari pengumpulan botol plastik, kemasan makanan, sampai limbah sekali pakai. Satu kali layanan, dampaknya bisa lama.'
    },
];


export default function ServicesSection() {
    return (
        <section className={styles.sectionWrapper}>
            {/* Star container */}
            <div className={styles.starContainer}>
                <div className={`${styles.star} ${styles.medium} ${styles.left1}`} />
                <div className={`${styles.star} ${styles.large} ${styles.left2}`} />
                <div className={`${styles.star} ${styles.small} ${styles.left3}`} />
                <div className={`${styles.star} ${styles.small} ${styles.left4}`} />
                <div className={`${styles.star} ${styles.medium} ${styles.left5}`} />

                <div className={`${styles.star} ${styles.large} ${styles.right1}`} />
                <div className={`${styles.star} ${styles.large} ${styles.right2}`} />
                <div className={`${styles.star} ${styles.xlarge} ${styles.right3}`} />
                <div className={`${styles.star} ${styles.medium} ${styles.right4}`} />
                <div className={`${styles.star} ${styles.small} ${styles.right5}`} />
                <div className={`${styles.star} ${styles.small} ${styles.right6}`} />
            </div>

            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h1>Layanan Kami</h1>
                    <p>Siapapun bisa menggunakan layanan SILAP untuk mengakhiri sampah</p>
                </div>

                {/* Grup 1: Untuk Semua Orang */}
                <ServiceGroup groupNumber={1} groupTitle="Untuk Semua Orang">
                    <Row className={`${styles.serviceRow}`}>
                        {servicesForEveryone.map(service => (
                            <Col key={service.title} className={styles.columnCard}>
                                <ServiceCard
                                    icon={service.icon}
                                    title={service.title}
                                    description={service.description}
                                />
                            </Col>
                        ))}
                    </Row>
                </ServiceGroup>

                {/* Grup 2: Untuk Perusahaan */}
                <ServiceGroup groupNumber={2} groupTitle="Untuk Perusahaan">
                    <Row className={`${styles.serviceRow}`}>
                        {servicesForCompanies.map(service => (
                            <Col key={service.title} className={styles.columnCard}>
                                <ServiceCard
                                    icon={service.icon}
                                    title={service.title}
                                    description={service.description}
                                />
                            </Col>
                        ))}
                    </Row>
                </ServiceGroup>
            </div>
        </section>
    );
}