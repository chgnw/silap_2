import { Container, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import { FaSmile, FaShieldAlt, FaClock, FaGift } from 'react-icons/fa';
import Solusi from '../../Medium/Solusi/Solusi';
import styles from './solusi.module.css';

// Data untuk fitur-fitur
const features = [
  {
    icon: <FaSmile size={48} color="#FFFFFF" />,
    title: 'User-friendly banget',
    description: 'Buat semua umur, dari anak muda sampai orang tua. Nggak ribet, tinggal klik langsung jalan.'
  },
  {
    icon: <FaShieldAlt size={48} color="#FFFFFF" />,
    title: 'Lingkungan jadi lebih terjaga',
    description: 'Bantu pisahin sampah, dukung daur ulang. Langkah kecil kamu bisa jadi dampak besar buat bumi.'
  },
  {
    icon: <FaClock size={48} color="#FFFFFF" />,
    title: 'Transparan & Real-time',
    description: 'Lihat proses pengangkutan & progress daur ulang langsung dari HP kamu.'
  },
  {
    icon: <FaGift size={48} color="#FFFFFF" />,
    title: 'Ada reward-nya juga!',
    description: 'Kelola sampah, dapat poin. Poin bisa ditukar jadi voucher, produk, atau hal menarik lainnya.'
  }
];

export default function HeroBanner() {
  return (
    <div className={styles.banner}>
      <Container>
        <Row className="align-items-center justify-content-center">
          
          {/* Kolom Kiri - Teks Utama */}
          <Col md={6} className='pe-4'>
            <div className={styles.bannerTextWrapper}>
              <h1 className={styles.bannerText}>
                Solusi Digital <br />
                untuk Kota <br />
                yang Lebih
                <span className={styles.bersihImageWrapper}>
                  <Image src="/assets/Bersih.png" alt="Bersih" width={200} height={70} />
                </span>
              </h1>
            </div>
          </Col>

          {/* Kolom Kanan - Daftar Fitur */}
          <Col md={6} className='ps-4'>
            {features.map((feature, index) => (
              <Solusi
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isLastItem={index === features.length - 1}
              />
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}