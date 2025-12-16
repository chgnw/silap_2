import styles from './card.module.css';

type CardProps = {
  icon: React.ReactNode;
  label: string;
  backgroundImage: string;
};

const Card = ({ icon, label, backgroundImage } : CardProps) => {
  return (
    <div 
      className={styles.cardCustom} 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {icon}
      <div className={styles.cardLabel}>{label}</div>
    </div>
  );
};

export default Card;