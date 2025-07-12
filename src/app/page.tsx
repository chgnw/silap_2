import { Container, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import styles from './page.module.css';
import { PiConfettiBold } from "react-icons/pi";
import { FaBuilding, FaUser } from "react-icons/fa";

export default function HomePage() {
  return (
    <Container fluid className="p-0">
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          SATU APLIKASI<br />
          UNTUK <span className={styles.heroUnderline}>SEMUA</span>
        </h1>
        <p className={styles.heroSubtitle}>
          <Image src="/images/angled-arrow-icon.png" alt="arrow icon" width={60} height={50} />
          Buang sampah sat set ya pakai SILAP!
        </p>
      </div>

      {/* Card Section */}
      <Container className="my-5 py-5">
        <Row className="justify-content-center g-4">
          {/* Card 1: Perusahaan */}
          <Col md={6} lg={3} className="d-flex justify-content-center">
            <div className={styles.cardCustom} style={{ backgroundImage: "url('images/building.png')" }}>
              <FaBuilding size={60} />
              <div className={styles.cardLabel}>Perusahaan</div>
            </div>
          </Col>

          {/* Card 2: Individu */}
          <Col md={6} lg={3} className="d-flex justify-content-center">
            <div className={styles.cardCustom} style={{ backgroundImage: "url('images/individual.png')" }}>
              <FaUser size={60} />
              <div className={styles.cardLabel}>Individu</div>
            </div>
          </Col>

          {/* Card 3: Event */}
          <Col md={6} lg={3} className="d-flex justify-content-center">
            <div className={styles.cardCustom} style={{ backgroundImage: "url('images/event.png')" }}>
              <PiConfettiBold size={60} />
              <div className={styles.cardLabel}>Event</div>
            </div>
          </Col>

          {/* Card 4: Mitra */}
          <Col md={6} lg={3} className="d-flex justify-content-center">
            <div className={styles.cardCustom} style={{ backgroundImage: "url('images/partner.png')" }}>
              <Image src="/images/icon-mitra.png" alt="Mitra Icon" width={90} height={90} />
              <div className={styles.cardLabel}>Mitra</div>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}