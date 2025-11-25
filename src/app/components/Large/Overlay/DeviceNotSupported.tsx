import styles from './DeviceNotSupported.module.css';

export default function DeviceNotSupported() {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.icon}>📱</div>
        <h1>Device Not Supported</h1>
        <p>
          Maaf, layar perangkat Anda terlalu kecil untuk menampilkan aplikasi ini.
        </p>
        <p>
          Silakan gunakan perangkat dengan layar yang lebih besar.
        </p>
      </div>
    </div>
  );
}