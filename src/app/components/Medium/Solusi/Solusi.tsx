import React from 'react';
import styles from './Solusi.module.css'; 

type SolusiItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLastItem?: boolean;
};

export default function SolusiItem({ icon, title, description }: SolusiItemProps) {
  return (
    <div className={styles.listWrapper}>
      <div className={styles.listIcon}>
        {icon}
      </div>
      <div className={styles.listTextWrapper}>
        <span className={styles.listTitle}>
          {title}
        </span>
        <p className={styles.listDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}