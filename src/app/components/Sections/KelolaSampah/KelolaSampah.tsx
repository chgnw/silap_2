import styles from './KelolaSampah.module.css';

export default function KelolaSampah() {
  return (
    <section className={styles.sectionWrap}>
      <div className={styles.card}>
        <h2 className={styles.heading}>
          Kelola Sampah 
          <br /> 
          Dengan <img src="/images/mudah.svg" alt="" className={styles.mudah}/>
        </h2>

        <div className={styles.mockupWrap}>
          {/* dashboard image (center) */}
          <div className={styles.dashboard}>
            <img src="/images/silap-dashboard.svg" alt="dashboard"/>
          </div>

          {/* floating label images */}
          <img src="/images/laporan-sampah.svg" alt="laporan" className={styles.tagTopRight} />
          <img src="/images/layanan-cepat.svg" alt="layanan" className={styles.tagRight} />
          <img src="/images/daur-ulang.svg" alt="daur" className={styles.tagLeft} />
        </div>
      </div>
    </section>
  );
}
