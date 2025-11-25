import styles from './JoinUs.module.css';
import Link from 'next/link';

export default function JoinUs() {
  return (
    <section className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.left}>
          <img src="/images/trash-bin.svg" alt="trash-bin"/>
        </div>

        <div className={styles.mid}>
          <h3>Ayo Kelola Sampah <br/> Dengan Bijak!</h3>
          <Link href="/login" className={styles.cta}>MASUK</Link>
        </div>


        <div className={styles.right}>
          <img src="/images/trash-truck.svg" alt="truck"/>
        </div>
      </div>
    </section>
  );
}
