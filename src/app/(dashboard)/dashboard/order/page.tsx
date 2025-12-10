"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

import {
  FaFileAlt,
  FaCheck,
  FaTruck,
  FaFlagCheckered,
  FaCopy,
} from "react-icons/fa";
import { LuPackageCheck } from "react-icons/lu";
import { MdAccessTimeFilled } from "react-icons/md";
import styles from "./order.module.css";

const OrderHistoryTable = dynamic(
  () => import("@/app/components/Large/OrderHistoryTable/OrderHistoryTable"),
  {
    ssr: false,
    loading: () => (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading riwayat transaksi...
      </div>
    ),
  }
);

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"onProgress" | "done">(
    "onProgress"
  );

  return (
    <div className={styles.orderContainer}>
      <h1 style={{ marginBottom: "3rem" }}>Pesanan Saya</h1>

      <div className={styles.activeTabContainer}>
        <button
          className={`${styles.tabs} ${
            activeTab === "onProgress" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("onProgress")}
        >
          Sedang Diproses
        </button>

        <button
          className={`${styles.tabs} ${
            activeTab === "done" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("done")}
        >
          Selesai
        </button>
      </div>

      {activeTab == "onProgress" && (
        <div className={styles.onProgressContainer}>
          <div className={styles.leftSide}>
            {/* Informasi armada */}
            <div className={styles.vehicleInfoContainer}>
              <h1>Armada SILAP</h1>

              <div className={styles.vehicleDetailContainer}>
                <div className={styles.vehicleImage}>
                  <Image
                    src="/images/dummy-truck.png"
                    alt="Vehicle"
                    width={200}
                    height={150}
                    loading="lazy"
                  />
                </div>

                <div className={styles.vehicleDetail}>
                  <span>Toyota Hilux Rangga</span>
                  <span style={{ color: "#2F5E44" }}>B 1234 SLP</span>
                  <span>Putih</span>
                </div>
              </div>
            </div>

            {/* Informasi driver */}
            <div className={styles.driverInfoContainer}>
              <h1>Informasi Driver</h1>

              <div className={styles.driverDetailContainer}>
                <div className={styles.driverImage}>
                  <Image
                    src="/images/dummy-profiles.png"
                    alt="Driver"
                    width={100}
                    height={100}
                    loading="lazy"
                  />
                </div>

                <div className={styles.driverDetail}>
                  <span>Driver Name</span>
                  <span style={{ color: "#666" }}>(+62) 89612345678</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightSide}>
            <div className={styles.cardContainer}>
              <h1 className={styles.title}>Pesenan Sedang Diproses</h1>

              <div className={styles.stepperContainer}>
                <div className={styles.stepperLine}></div>

                {/* Pesanan Dibuat */}
                <div className={styles.stepItem}>
                  <div className={styles.iconWrapper}>
                    <FaFileAlt size={20} color="#555" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>Pesenan dibuat</span>
                    <span className={styles.stepTime}>08.00</span>
                  </div>
                </div>

                {/* Pesanan Terkonfirmasi */}
                <div className={styles.stepItem}>
                  <div className={styles.iconWrapper}>
                    <FaCheck size={20} color="#555" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>
                      Pesenan dikonfirmasi
                    </span>
                    <span className={styles.stepTime}>08.10</span>
                  </div>
                </div>

                {/* Menunggu waktu penjemputan */}
                <div className={styles.stepItem}>
                  <div className={styles.iconWrapper}>
                    <MdAccessTimeFilled size={20} color="#555" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>
                      Menunggu Waktu Penjemputan
                    </span>
                    <span className={styles.stepTime}>08.10</span>
                  </div>
                </div>

                {/* Sedang dalam penjemputan */}
                <div className={`${styles.stepItem} ${styles.active}`}>
                  <div className={styles.iconWrapperActive}>
                    <FaTruck size={20} color="#fff" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>
                      Armada Menuju lokasi Pick Up
                    </span>
                    <span className={styles.stepTime}>13.00</span>
                  </div>
                </div>

                {/* Pickup */}
                <div className={styles.stepItem}>
                  <div className={styles.iconWrapper}>
                    <LuPackageCheck size={20} color="#555" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>Armada Pick Up</span>
                    <span className={styles.stepTime}>13.30</span>
                  </div>
                </div>

                {/* Selesai */}
                <div className={styles.stepItem}>
                  <div className={styles.iconWrapper}>
                    <FaFlagCheckered size={20} color="#555" />
                  </div>
                  <div className={styles.stepText}>
                    <span className={styles.stepLabel}>Pesenan Selesai</span>
                    <span className={styles.stepTime}>13.40</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.column}>
                  {/* Lokasi Armada */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionHeader}>
                      <span
                        className={`${styles.dot} ${styles.limeDot}`}
                      ></span>
                      Lokasi Armada
                    </h3>
                    <div className={styles.row}>
                      <span className={styles.label}>Wilayah</span>
                      <span className={styles.value}>Jakarta Barat</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>Kode Pos</span>
                      <span className={styles.value}>11560</span>
                    </div>
                  </div>

                  {/* Info Pick Up */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionHeader}>
                      <span className={`${styles.dot} ${styles.redDot}`}></span>
                      Info Pick Up
                    </h3>

                    <div
                      className={styles.row}
                      style={{ alignItems: "center" }}
                    >
                      <span className={styles.label}>No Resi</span>
                      <span className={styles.valueResi}>
                        <FaCopy size={16} className={styles.copyIcon} />{" "}
                        JV-115601811
                      </span>
                    </div>

                    <div className={styles.addressBlock}>
                      <span className={styles.label}>Alamat</span>
                      <div className={styles.addressContent}>
                        <strong>Javier Adios</strong>
                        <div>(+62)82210121343</div>
                        <div className={styles.addressText}>
                          Gedung Millenium Centennial Center Jl. Jenderal
                          Sudirman Kav. 25, RT.10/RW.1, Karet
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.column}>
                  {/* Waktu Pick Up */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionHeader}>
                      <span
                        className={`${styles.dot} ${styles.cyanDot}`}
                      ></span>
                      Waktu Pick Up
                    </h3>
                    <div className={styles.row}>
                      <span className={styles.label}>Tanggal</span>
                      <span className={styles.value}>18 November 2025</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.label}>Jam</span>
                      <span className={styles.value}>12.00 - 13.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab == "done" && <OrderHistoryTable />}
    </div>
  );
}
