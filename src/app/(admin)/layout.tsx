import styles from './admin/admin.module.css';

export default function AdminLayout({
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
