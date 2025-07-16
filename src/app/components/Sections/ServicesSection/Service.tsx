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
        icon: <Image src="/assets/dropoff-icon.png" alt="Drop Off" width={24} height={24} />,
        title: 'Drop Off',
        description: 'Punya satu botol plastik atau barang kecil lainnya? Kamu bisa langsung drop ke Recycling Center / point terdekat. Cocok buat kamu yang mobile dan mau kontribusi langsung dalam gerakan daur ulang.'
    },
    {
        icon: <Image src="/assets/streak-icon.png" alt="Streak" width={24} height={24} />,
        title: 'Streak',
        description: "Setiap kali kamu kelola sampah dengan baik, kamu dapet streak. Semakin konsisten, semakin banyak manfaat dan poin yang bisa kamu kumpulin. It's like a daily mission to save the planet dan kamu pahlawannya!"
    },
    {
        icon: <Image src="/assets/sedekah-icon.png" alt="Drop Off" width={24} height={24} />,
        title: 'Sedekah Makanan & Barang Tidak Terpakai',
        description: 'Makanan sisa yang masih layak? Baju atau barang yang udah gak dipakai tapi masih bagus? Kamu bisa donasiin lewat SILAP. Tim kami akan jemput dan salurkan ke orang-orang yang membutuhkan.'
    },
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
                <div className={styles.starContainer}>
                    <div className={`${styles.star} ${styles.medium} ${styles.green} ${styles.left1}`} />
                    <div className={`${styles.star} ${styles.large} ${styles.green} ${styles.left2}`} />
                    <div className={`${styles.star} ${styles.small} ${styles.green} ${styles.left3}`} />
                    <div className={`${styles.star} ${styles.small} ${styles.green} ${styles.left4}`} />
                    <div className={`${styles.star} ${styles.medium} ${styles.green} ${styles.left5}`} />

                    <div className={`${styles.star} ${styles.large} ${styles.green} ${styles.right1}`} />
                    <div className={`${styles.star} ${styles.large} ${styles.green} ${styles.right2}`} />
                    <div className={`${styles.star} ${styles.xlarge} ${styles.green} ${styles.right3}`} />
                    <div className={`${styles.star} ${styles.medium} ${styles.green} ${styles.right4}`} />
                    <div className={`${styles.star} ${styles.small} ${styles.green} ${styles.right5}`} />
                    <div className={`${styles.star} ${styles.small} ${styles.green} ${styles.right6}`} />
                </div>
            </div>

            <Container>
                <div className={styles.sectionHeader}>
                    <h1>Layanan Kami</h1>
                    <p>Siapapun bisa menggunakan layanan SILAP untuk mengakhiri sampah</p>
                </div>

                {/* Grup 1: Untuk Semua Orang */}
                <ServiceGroup groupNumber={1} groupTitle="Untuk Semua Orang">
                    <Row>
                        {servicesForEveryone.map(service => (
                            <Col sm={12} md={6} key={service.title} className="mb-4">
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
                    <Row>
                        {servicesForCompanies.map(service => (
                            <Col sm={12} md={6} key={service.title} className="mb-4">
                                <ServiceCard
                                    icon={service.icon}
                                    title={service.title}
                                    description={service.description}
                                />
                            </Col>
                        ))}
                    </Row>
                </ServiceGroup>
            </Container>
        </section>
    );
}