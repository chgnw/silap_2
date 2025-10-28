import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>🌿 Mitra Dashboard</div>
        <ul className={styles.navLinks}>
          <li>Home</li>
          <li>Transaksi</li>
          <li>Profile</li>
        </ul>
      </nav>

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
