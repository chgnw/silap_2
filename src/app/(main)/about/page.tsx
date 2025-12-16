'use client';

import styles from './about.module.css';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Nama Lengkap 1',
      role: 'Role / Jabatan',
      major: 'Jurusan Kuliah',
      image: 'https://ui-avatars.com/api/?name=User+One&background=random&size=400'
    },
    {
      name: 'Nama Lengkap 2',
      role: 'Role / Jabatan',
      major: 'Jurusan Kuliah',
      image: 'https://ui-avatars.com/api/?name=User+Two&background=random&size=400'
    },
    {
      name: 'Nama Lengkap 3',
      role: 'Role / Jabatan',
      major: 'Jurusan Kuliah',
      image: 'https://ui-avatars.com/api/?name=User+Three&background=random&size=400'
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Tentang SILAP</h1>
          <p>
            SILAP (Sistem Informasi Layanan Angkut & Pemilahan) adalah platform digital yang
            menjembatani kesenjangan antara rumah tangga dan industri daur ulang,
            menciptakan ekosistem pengelolaan sampah yang efisien, transparan, dan berkelanjutan.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.visionMission}>
          <div className={styles.vmCard}>
            <div className={styles.vmIcon}>👁️</div>
            <h2>Visi</h2>
            <p>
              Menjadi pionir revolusi pengelolaan sampah digital di Indonesia untuk mewujudkan
              lingkungan yang bebas sampah (Zero Waste) dan masyarakat yang sadar lingkungan.
            </p>
          </div>
          <div className={styles.vmCard}>
            <div className={styles.vmIcon}>🚀</div>
            <h2>Misi</h2>
            <p>
              1. Menyediakan layanan penjemputan sampah yang terintegrasi dan mudah diakses.<br />
              2. Mengedukasi masyarakat tentang pentingnya pemilahan sampah dari sumber.<br />
              3. Memberdayakan mitra pengangkut sampah dengan teknologi dan kesejahteraan yang lebih baik.<br />
              4. Mendorong ekonomi sirkular melalui pemanfaatan kembali material daur ulang.
            </p>
          </div>
        </div>

        <div className={styles.teamSection}>
          <div className={styles.teamHeader}>
            <h2>Tim Kami</h2>
            <p>Orang-orang dibalik inovasi SILAP.</p>
          </div>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, idx) => (
              <div key={idx} className={styles.teamCard}>
                <img src={member.image} alt={member.name} className={styles.teamImage} />
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{member.name}</div>
                  <div className={styles.teamRole}>{member.role}</div>
                  <div className={styles.teamMajor}>{member.major}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}