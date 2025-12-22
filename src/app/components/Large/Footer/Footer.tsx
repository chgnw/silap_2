'use client';

import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import SilapLogo from '../../Icons/SilapLogo';
import styles from './footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.brandColumn}>
                        <div className={styles.logoWrapper}>
                            <SilapLogo color="#ffffff" width={40} height={40} />
                            <span className={styles.brandName}>SILAP</span>
                        </div>
                        <p className={styles.brandDesc}>
                            Solusi manajemen sampah terintegrasi untuk masa depan yang lebih hijau dan berkelanjutan.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
                            <a href="#" aria-label="Twitter"><FaTwitter /></a>
                            <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
                        </div>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4>Menu</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/services">Services</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4>Layanan</h4>
                        <ul>
                            <li><Link href="/services#alur-layanan">Daur Ulang</Link></li>
                            <li><Link href="/#layanan-kami">Layanan Silap</Link></li>
                            <li><Link href="/pricing">Langganan</Link></li>
                        </ul>
                    </div>

                    <div className={styles.contactColumn}>
                        <h4>Kontak</h4>
                        <p>123 Green Street, Eco District</p>
                        <p>Jakarta Selatan, 12000</p>
                        <p className={styles.email}>silap4everyone@gmail.com</p>
                        <p>+62 812 3456 7890</p>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <p>&copy; {currentYear} PT Silap Solusi Indonesia. All rights reserved.</p>
                    <div className={styles.legalLinks}>
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
