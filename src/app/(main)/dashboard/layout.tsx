import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
