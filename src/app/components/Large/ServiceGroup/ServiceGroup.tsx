import React from 'react';
import styles from './ServiceGroup.module.css';

type ServiceGroupProps = {
  groupNumber: number;
  groupTitle: string;
  children: React.ReactNode; 
};

export default function ServiceGroup({ groupNumber, groupTitle, children }: ServiceGroupProps) {
  return (
    <div className={styles.groupContainer}>
      <div className={styles.groupHeader}>
        <div className={styles.numberCircle}>{groupNumber}</div>
        <h2 className={styles.groupTitle}>{groupTitle}</h2>
      </div>
      <div className={styles.cardGrid}>
        {children}
      </div>
    </div>
  );
}