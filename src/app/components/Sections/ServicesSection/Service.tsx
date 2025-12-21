import Link from 'next/link';
import { Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import ServiceCard from '../../Medium/ServiceCard/ServiceCard';
import styles from './Service.module.css';

// Updated data based on user request
const services = [
    {
        icon: <Image src="/assets/pickup-icon.png" alt="Individu" width={24} height={24} />,
        title: 'Individu',
        description: 'Solusi pengelolaan sampah untuk kebutuhan rumah tangga dengan sistem pickup terjadwal, pelacakan real time, dan laporan komposisi sampah. SILAP membantu individu membangun kebiasaan memilah sampah dengan mudah, praktis, dan berkelanjutan.'
    },
    {
        icon: <Image src="/assets/business-icon.png" alt="Bisnis" width={24} height={24} />,
        title: 'Bisnis',
        description: 'Layanan pengelolaan sampah terintegrasi untuk bisnis dengan frekuensi pickup harian dan kapasitas besar. Dilengkapi dashboard monitoring, dan laporan untuk mendukung operasional bisnis yang bersih, efisien, dan berorientasi keberlanjutan.'
    },
    {
        icon: <Image src="/assets/event-icon.png" alt="Event" width={24} height={24} />,
        title: 'Event',
        description: 'Solusi pengelolaan sampah fleksibel untuk berbagai jenis event. Dengan sistem estimasi biaya berdasarkan kebutuhan, dan laporan, SILAP membantu event berjalan lebih tertata sekaligus mendukung komitmen sustainability.'
    }
];

export default function ServicesSection() {
    return (
        <section id="layanan-kami" className={styles.sectionWrapper}>
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

                <div className={styles.serviceGrid}>
                    {services.map(service => (
                        <div key={service.title} style={{ height: '100%' }}>
                            <ServiceCard
                                icon={service.icon}
                                title={service.title}
                                description={service.description}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link
                        href="/services"
                        className={styles.seeMoreBtn}
                    >
                        Lihat Selengkapnya
                    </Link>
                </div>
            </div>
        </section>
    );
}