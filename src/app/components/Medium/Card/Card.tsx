import { Col } from 'react-bootstrap';
import styles from './card.module.css';

type CardProps = {
  icon: React.ReactNode;
  label: string;
  backgroundImage: string;
};

const Card = ({ icon, label, backgroundImage } : CardProps) => {
  return (
    <Col md={6} lg={3} className="d-flex justify-content-center">
      <div 
        className={styles.cardCustom} 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {icon}
        <div className={styles.cardLabel}>{label}</div>
      </div>
    </Col>
  );
};

export default Card;