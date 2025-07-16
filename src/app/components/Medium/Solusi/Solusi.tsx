import React from 'react';
import styles from './Solusi.module.css'; 

type SolusiItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLastItem?: boolean;
};

export default function SolusiItem({ icon, title, description, isLastItem = false }: SolusiItemProps) {
  const wrapperClass = `${styles.listWrapper} ${!isLastItem ? 'mb-4' : ''}`;

  return (
    <div className={wrapperClass}>
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