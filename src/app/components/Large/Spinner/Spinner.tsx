"use client";

import React from "react";
import styles from "./spinner.module.css";

export default function FullPageSpinner({ message = "Mohon tunggu..." }: { message?: string }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  );
}
