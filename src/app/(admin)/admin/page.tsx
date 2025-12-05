import React from 'react';
import Link from 'next/link';
import { FaUser, FaRecycle, FaGift, FaTruck,  FaCogs } from 'react-icons/fa';
import styles from './admin.module.css';

export default function AdminHomePage() {
  const quickLinks = [
    {
      title: 'User Management',
      desc: 'Atur admin yang dapat mengakses sistem.',
      icon: <FaUser size={40} />,
      href: '/admin/admins',
      color: '#FAD25A'
    },
    {
      title: 'Manage Waste',
      desc: 'Atur kategori dan poin sampah per unit.',
      icon: <FaRecycle size={40} />,
      href: '/admin/waste',
      color: '#2F5E44'
    },
    {
      title: 'Manage Rewards',
      desc: 'Update stok hadiah dan poin penukaran.',
      icon: <FaGift size={40} />,
      href: '/admin/rewards',
      color: '#ED1C24'
    },
    {
      title: 'Fleet & Drivers',
      desc: 'Verifikasi driver dan kelola kendaraan.',
      icon: <FaTruck size={40} />,
      href: '/admin/drivers-vehicles',
      color: '#1565C0'
    },
    {
      title: 'Other Config',
      desc: 'Pengaturan Tier user dan status transaksi.',
      icon: <FaCogs size={40} />,
      href: '/admin/others',
      color: '#A4B465'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      <header className={styles.welcomeHeader}>
        <h1>Welcome, Admin!</h1>
        <p>
          Ini adalah panel kontrol utama. Anda dapat mengelola Master Data, 
          mem-verifikasi Driver, dan mengatur konfigurasi sistem melalui menu di bawah ini 
          atau melalui sidebar di sebelah kiri.
        </p>
      </header>

      <div className={styles.gridContainer}>
        {quickLinks.map((item, index) => (
          <Link href={item.href} key={index} className={styles.card}>
            <div className={styles.iconWrapper} style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className={styles.cardContent}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}