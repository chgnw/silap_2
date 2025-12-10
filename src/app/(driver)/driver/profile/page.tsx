"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaPencilAlt, FaSave, FaTimes } from "react-icons/fa";
import { showToast } from "@/lib/toastHelper";
import styles from "./profile.module.css";

interface DriverInfo {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  role_name: string;
  is_verified: boolean;
  is_available: boolean;
  total_deliveries: number;
}

export default function DriverProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Fetch driver info
  const fetchDriverInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/info");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        setDriverInfo(data.data);
        setProfilePicture(data.data.profile_picture);
        setFormData({
          firstName: data.data.first_name || "",
          lastName: data.data.last_name || "",
          email: data.data.email || "",
          phoneNumber: data.data.phone_number || "",
        });
      }
    } catch (error) {
      console.error("Error fetching driver info:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverInfo();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, fetchDriverInfo]);

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        "error",
        "Format file tidak valid. Gunakan JPEG, PNG, atau WebP"
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("error", "Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.message === "SUCCESS") {
        showToast("success", "Foto profil berhasil diupload");
        setProfilePicture(data.data.profile_picture);
        await fetchDriverInfo();
        await update();
      } else {
        showToast("error", data.error || "Gagal mengupload foto profil");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showToast("error", "Terjadi kesalahan saat mengupload");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("error", "Format email tidak valid!");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/driver/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Profile updated successfully!");
        await fetchDriverInfo();
        await update();
        setIsEditing(false);
      } else {
        showToast("error", result.error || "Failed to update profile");
      }
    } catch (error) {
      showToast("error", "An error occurred");
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (driverInfo) {
      setFormData({
        firstName: driverInfo.first_name || "",
        lastName: driverInfo.last_name || "",
        email: driverInfo.email || "",
        phoneNumber: driverInfo.phone_number || "",
      });
    }
    setIsEditing(false);
  };

  if (loading || status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className={styles.loadingContainer}>
        <p>Data driver tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>Profile Saya</h1>
        <div className={styles.actionButtons}>
          {!isEditing ? (
            <button
              className={`${styles.btn} ${styles.btnEdit}`}
              onClick={() => setIsEditing(true)}
            >
              <FaPencilAlt /> Edit Profile
            </button>
          ) : (
            <>
              <button
                className={`${styles.btn} ${styles.btnSave}`}
                onClick={handleSave}
                disabled={isSaving}
              >
                <FaSave /> {isSaving ? "Menyimpan.." : "Simpan"}
              </button>
              <button
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={handleCancel}
                disabled={isSaving}
              >
                <FaTimes /> Batal
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileSidebar}>
          <div className={styles.profileAvatarWrapper}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className={styles.profileAvatarImage}
              />
            ) : (
              <div className={styles.profileAvatar}>
                {driverInfo.first_name.charAt(0)}
                {driverInfo.last_name?.charAt(0) || ""}
              </div>
            )}
            <label htmlFor="profile-upload" className={styles.uploadButton}>
              <FaPencilAlt />
              <input
                id="profile-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfilePictureUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
            {uploading && (
              <div className={styles.uploadingOverlay}>
                <div className={styles.spinner}></div>
              </div>
            )}
          </div>
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Total Pickup</div>
              <div className={styles.statValue}>
                {driverInfo.total_deliveries}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Status</div>
              <div className={styles.statValue}>
                {driverInfo.is_verified
                  ? "Terverifikasi"
                  : "Belum Terverifikasi"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.profileMain}>
          <div className={styles.formGrid}>
            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Depan</label>
              <input
                type="text"
                name="firstName"
                className={styles.formInput}
                value={formData.firstName}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Belakang</label>
              <input
                type="text"
                name="lastName"
                className={styles.formInput}
                value={formData.lastName}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.formInput}
                value={formData.email}
                readOnly
              />
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>No. Telepon</label>
              <input
                type="text"
                name="phoneNumber"
                className={styles.formInput}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
