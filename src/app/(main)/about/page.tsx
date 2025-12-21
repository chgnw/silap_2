'use client';

import styles from './about.module.css';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Christopher Gunawan',
      role: 'Chief Technology Officer',
      major: 'Computer Science Binus',
      image: 'https://ui-avatars.com/api/?name=User+One&background=random&size=400',
      linkedin: 'https://www.linkedin.com'
    },
    {
      name: 'Pradipa Javier Fatah',
      role: 'Chief Executive Officer',
      major: 'Computer Science Binus',
      image: '/assets/PradipaJavierFatah_CEO.png',
      linkedin: 'https://www.linkedin.com/in/pradipajavierfatah/'
    },
    {
      name: 'Abdi Abiyasa',
      role: 'Chief Operating Officer',
      major: 'Computer Science Binus',
      image: 'https://ui-avatars.com/api/?name=User+Three&background=random&size=400',
      linkedin: 'https://www.linkedin.com'
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Tentang SILAP</h1>
          <p>
            <strong>SILAP (Sistem Informasi Layanan Angkut & Pemilahan)</strong> adalah platform digital yang hadir untuk menyederhanakan dan memperbaiki proses pengelolaan sampah. Kami menghubungkan <strong>rumah tangga</strong> dan <strong>pelaku usaha</strong> dalam satu ekosistem yang terintegrasi, sehingga proses pengangkutan dan pemilahan sampah menjadi lebih <strong>efisien, transparan, dan berkelanjutan.</strong>
          </p>
          <p>
            Melalui pemanfaatan teknologi, SILAP mendorong <strong>pengelolaan sampah yang lebih bertanggung jawab</strong>, meningkatkan <strong>nilai ekonomi sampah</strong>, serta mendukung terciptanya <strong>lingkungan perkotaan yang lebih bersih dan berkelanjutan.</strong>
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.visionMission}>
          <div className={styles.vmCard}>
            <div className={styles.vmIcon}>🌱</div>
            <h2>Visi Kami</h2>
            <p>
              Menjadi pionir revolusi pengelolaan sampah digital di Indonesia untuk mewujudkan
              lingkungan yang bebas sampah (Zero Waste) dan masyarakat yang sadar lingkungan.
            </p>
          </div>
          <div className={styles.vmCard}>
            <div className={styles.vmIcon}>✨</div>
            <h2>Misi Kami</h2>
            <p style={{ textAlign: 'left', display: 'inline-block' }}>
              1. Menyediakan layanan penjemputan sampah yang terintegrasi dan mudah diakses.<br />
              2. Mengedukasi masyarakat tentang pentingnya pemilahan sampah dari sumber.<br />
              3. Memberdayakan mitra pengangkut sampah dengan teknologi dan kesejahteraan yang lebih baik.<br />
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
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkedinBtn}>
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}