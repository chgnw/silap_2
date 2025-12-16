"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaPencilAlt, FaSave, FaTimes, FaLock } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { showToast } from "@/lib/toastHelper";
import { useLocationData } from "@/app/hooks/useLocationData";
import styles from "./profile.module.css";

interface LocationItem {
  id: string;
  text: string;
}

interface SearchResult {
  negara: string;
  provinsi: string;
  kabkota: string;
  kecamatan: string;
  desakel: string;
  kodepos: string;
}

interface DriverInfo {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  profile_picture: string | null;
  province: string | null;
  regency: string | null;
  subdistrict: string | null;
  village: string | null;
  address: string | null;
  postal_code: string | null;
  role_name: string;
  is_verified: boolean;
  is_active: boolean;
  total_deliveries: number;
  id_card_number: string | null;
  license_number: string | null;
  operational_area: string | null;
  assigned_vehicle_id: number | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_license_plate: string | null;
  vehicle_category: string | null;
}

const censorText = (text: string | null): string => {
  if (!text) return "Belum diisi";
  if (text.length <= 4) return text;
  const visiblePart = text.slice(-4);
  const censoredPart = "*".repeat(text.length - 4);
  return censoredPart + visiblePart;
};

export default function DriverProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const locationData = useLocationData();

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [postalCodes, setPostalCodes] = useState<string[]>([]);

  const [countryCode, setCountryCode] = useState("+62");
  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    province: "",
    regency: "",
    subdistrict: "",
    village: "",
    address: "",
    postalCode: "",
  });

  // Helper function to separate country code from phone number
  const separateCountryCode = (fullPhoneNumber: string) => {
    if (!fullPhoneNumber) {
      return { countryCode: "+62", localNumber: "" };
    }

    if (countryOptions.length > 0) {
      const sortedOptions = [...countryOptions].sort(
        (a, b) => b.code.length - a.code.length
      );
      const found = sortedOptions.find((c) =>
        fullPhoneNumber.startsWith(c.code)
      );

      if (found) {
        const localNumber = fullPhoneNumber.substring(found.code.length).trim();
        return { countryCode: found.code, localNumber };
      }
    }

    const commonCodes = ["+62", "+1", "+44", "+61", "+81", "+86", "+91"];
    for (const code of commonCodes) {
      if (fullPhoneNumber.startsWith(code)) {
        const localNumber = fullPhoneNumber.substring(code.length).trim();
        return { countryCode: code, localNumber };
      }
    }

    return { countryCode: "+62", localNumber: fullPhoneNumber };
  };

  // Fetch driver info
  const fetchDriverInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/info");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        const driver = data.data;
        setDriverInfo(driver);
        setProfilePicture(driver.profile_picture);

        const { countryCode: code, localNumber } = separateCountryCode(
          driver.phone || ""
        );
        setCountryCode(code);

        setFormData({
          firstName: driver.first_name || "",
          lastName: driver.last_name || "",
          email: driver.email || "",
          phoneNumber: localNumber,
          province: driver.province || "",
          regency: driver.regency || "",
          subdistrict: driver.subdistrict || "",
          village: driver.village || "",
          address: driver.address || "",
          postalCode: driver.postal_code || "",
        });

        // Initialize location data
        if (driver.province) {
          const result = await locationData.loadLocationHierarchy(
            driver.province,
            driver.regency,
            driver.subdistrict,
            driver.village
          );

          setProvinces(result.provinces);
          setRegencies(result.regencies);
          setDistricts(result.districts);
          setVillages(result.villages);

          setSelectedProvince(result.selectedIds.provinceId);
          setSelectedRegency(result.selectedIds.regencyId);
          setSelectedDistrict(result.selectedIds.districtId);
          setSelectedVillage(result.selectedIds.villageId);

          if (driver.village && driver.postal_code) {
            const postalCodesData = await locationData.fetchPostalCodes(
              driver.village,
              driver.province,
              driver.regency,
              driver.subdistrict
            );
            setPostalCodes(postalCodesData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching driver info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverInfo();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, fetchDriverInfo]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
        );
        const data = await res.json();

        const formatted = data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => ({
            name: c.name.common,
            code: `${c.idd.root}${c.idd.suffixes ? c.idd.suffixes[0] : ""}`,
            cca2: c.cca2,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountryOptions(formatted);
      } catch (err) {
        console.error("Gagal ambil data negara, fallback manual", err);
        setCountryOptions([{ name: "Indonesia", code: "+62" }]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleEdit = async () => {
    setIsEditing(true);

    if (provinces.length === 0) {
      const provincesData = await locationData.fetchProvinces();
      setProvinces(provincesData);
    }
  };

  const handleProvinceChange = async (e: any) => {
    const provId = e.target.value;
    const province = provinces.find((p) => p.id === provId);

    setSelectedProvince(provId);
    setSelectedRegency("");
    setSelectedDistrict("");
    setSelectedVillage("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    setFormData((prev) => ({
      ...prev,
      province: province ? province.text : "",
      regency: "",
      subdistrict: "",
      village: "",
      postalCode: "",
    }));

    if (provId) {
      const regenciesData = await locationData.fetchRegencies(provId);
      setRegencies(regenciesData);
    }
  };

  const handleRegencyChange = async (e: any) => {
    const regId = e.target.value;
    const regency = regencies.find((r) => r.id === regId);

    setSelectedRegency(regId);
    setSelectedDistrict("");
    setSelectedVillage("");
    setDistricts([]);
    setVillages([]);
    setPostalCodes([]);

    setFormData((prev) => ({
      ...prev,
      regency: regency ? regency.text : "",
      subdistrict: "",
      village: "",
      postalCode: "",
    }));

    if (regId) {
      const districtsData = await locationData.fetchDistricts(regId);
      setDistricts(districtsData);
    }
  };

  const handleDistrictChange = async (e: any) => {
    const distId = e.target.value;
    const district = districts.find((d) => d.id === distId);

    setSelectedDistrict(distId);
    setSelectedVillage("");
    setVillages([]);
    setPostalCodes([]);

    setFormData((prev) => ({
      ...prev,
      subdistrict: district ? district.text : "",
      village: "",
      postalCode: "",
    }));

    if (distId) {
      const villagesData = await locationData.fetchVillages(distId);
      setVillages(villagesData);
    }
  };

  const handleVillageChange = async (e: any) => {
    const villageId = e.target.value;
    const village = villages.find((v) => v.id === villageId);

    setSelectedVillage(villageId);
    setFormData((prev) => ({
      ...prev,
      village: village ? village.text : "",
      postalCode: "",
    }));
    setPostalCodes([]);

    if (
      village &&
      formData.province &&
      formData.regency &&
      formData.subdistrict
    ) {
      const postalCodesData = await locationData.fetchPostalCodes(
        village.text,
        formData.province,
        formData.regency,
        formData.subdistrict
      );

      setPostalCodes(postalCodesData);

      if (postalCodesData.length === 1) {
        setFormData((prev) => ({
          ...prev,
          postalCode: postalCodesData[0],
        }));
      }
    }
  };

  const handleCancel = async () => {
    if (driverInfo) {
      const { countryCode: code, localNumber } = separateCountryCode(
        driverInfo.phone || ""
      );
      setCountryCode(code);

      setFormData({
        firstName: driverInfo.first_name || "",
        lastName: driverInfo.last_name || "",
        email: driverInfo.email || "",
        phoneNumber: localNumber,
        province: driverInfo.province || "",
        regency: driverInfo.regency || "",
        subdistrict: driverInfo.subdistrict || "",
        village: driverInfo.village || "",
        address: driverInfo.address || "",
        postalCode: driverInfo.postal_code || "",
      });

      // Reset location data
      if (driverInfo.province && provinces.length > 0) {
        try {
          const originalProvince = provinces.find(
            (p) => p.text === driverInfo.province
          );
          if (originalProvince) {
            setSelectedProvince(originalProvince.id);

            if (driverInfo.regency) {
              const regencyRes = await fetch(
                `https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${originalProvince.id}`
              );
              const regencyData = await regencyRes.json();

              if (regencyData.status === 200 && regencyData.result) {
                setRegencies(regencyData.result);
                const originalRegency = regencyData.result.find(
                  (r: LocationItem) => r.text === driverInfo.regency
                );

                if (originalRegency) {
                  setSelectedRegency(originalRegency.id);

                  if (driverInfo.subdistrict) {
                    const districtRes = await fetch(
                      `https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${originalRegency.id}`
                    );
                    const districtData = await districtRes.json();

                    if (districtData.status === 200 && districtData.result) {
                      setDistricts(districtData.result);
                      const originalDistrict = districtData.result.find(
                        (d: LocationItem) => d.text === driverInfo.subdistrict
                      );

                      if (originalDistrict) {
                        setSelectedDistrict(originalDistrict.id);

                        if (driverInfo.village) {
                          const villageRes = await fetch(
                            `https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${originalDistrict.id}`
                          );
                          const villageData = await villageRes.json();

                          if (
                            villageData.status === 200 &&
                            villageData.result
                          ) {
                            setVillages(villageData.result);
                            const originalVillage = villageData.result.find(
                              (v: LocationItem) => v.text === driverInfo.village
                            );
                            if (originalVillage) {
                              setSelectedVillage(originalVillage.id);

                              if (driverInfo.postal_code) {
                                const searchRes = await fetch(
                                  `https://alamat.thecloudalert.com/api/cari/index/?keyword=${encodeURIComponent(
                                    driverInfo.village
                                  )}`
                                );
                                const searchData = await searchRes.json();

                                if (
                                  searchData.status === 200 &&
                                  searchData.result &&
                                  searchData.result.length > 0
                                ) {
                                  const matchedResults =
                                    searchData.result.filter(
                                      (item: SearchResult) =>
                                        item.provinsi === driverInfo.province &&
                                        item.kabkota === driverInfo.regency &&
                                        item.kecamatan ===
                                          driverInfo.subdistrict &&
                                        item.desakel === driverInfo.village
                                    );

                                  if (matchedResults.length > 0) {
                                    const postalCodesArray = matchedResults.map(
                                      (item: SearchResult) => item.kodepos
                                    );
                                    const uniquePostalCodes: string[] = [
                                      ...new Set<string>(postalCodesArray),
                                    ];
                                    setPostalCodes(uniquePostalCodes);
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to reset location data:", error);
        }
      }
    }
    setIsEditing(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "");

    if (val.startsWith("0")) val = val.substring(1);

    const codeOnly = countryCode.replace("+", "");
    if (val.startsWith(codeOnly)) val = val.substring(codeOnly.length);

    setFormData((prev) => ({ ...prev, phoneNumber: val }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        "error",
        "Format file tidak valid. Gunakan JPEG, PNG, atau WebP"
      );
      return;
    }

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

  const handleSave = async () => {
    setIsSaving(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("error", "Format email tidak valid!");
      setIsSaving(false);
      return;
    }

    if (formData.phoneNumber.length < 9 || formData.phoneNumber.length > 15) {
      showToast("error", "Nomor telepon tidak valid.");
      setIsSaving(false);
      return;
    }

    const fullPhoneNumber = `${countryCode} ${formData.phoneNumber}`;

    try {
      const response = await fetch("/api/driver/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: fullPhoneNumber,
          province: formData.province,
          regency: formData.regency,
          subdistrict: formData.subdistrict,
          village: formData.village,
          address: formData.address,
          postalCode: formData.postalCode,
        }),
      });

      const result = await response.json();

      if (result.message === "SUCCESS") {
        showToast("success", "Profile berhasil diperbarui!");
        await fetchDriverInfo();
        await update();
        setIsEditing(false);
      } else {
        showToast("error", result.error || "Gagal memperbarui profile");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan");
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === "loading") {
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
              onClick={handleEdit}
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
              <FaPencilAlt style={{ color: "#FFF" }} />
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
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Area Operasional</div>
              <div className={styles.statValue} style={{ fontSize: "0.8rem" }}>
                {driverInfo.operational_area || "Belum diatur"}
              </div>
            </div>
            {driverInfo.assigned_vehicle_id && (
              <div className={styles.statItem}>
                <div className={styles.statLabel}>Kendaraan</div>
                <div
                  className={styles.statValue}
                  style={{ fontSize: "0.75rem" }}
                >
                  {driverInfo.vehicle_brand} {driverInfo.vehicle_model}
                  <br />
                  <span style={{ color: "#2f5e44" }}>
                    {driverInfo.vehicle_license_plate}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileMain}>
          <div className={styles.formGrid}>
            {/* Confidential Fields - Always Read Only */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaLock style={{ marginRight: "6px", fontSize: "11px" }} />
                No. KTP (ID Card)
              </label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.confidentialInput}`}
                value={censorText(driverInfo.id_card_number)}
                readOnly
                title="Data ini bersifat rahasia dan tidak dapat diubah"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaLock style={{ marginRight: "6px", fontSize: "11px" }} />
                No. SIM (License)
              </label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.confidentialInput}`}
                value={censorText(driverInfo.license_number)}
                readOnly
                title="Data ini bersifat rahasia dan tidak dapat diubah"
              />
            </div>

            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Nama Depan (First Name)
              </label>
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
              <label className={styles.formLabel}>
                Nama Belakang (Last Name)
              </label>
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
              <label className={styles.formLabel}>
                No. Telp (Phone Number)
              </label>

              <div className={styles.formInputPhoneNumberContainer}>
                <div
                  className={`${styles.formInput} ${styles.formInputPhoneNumber}`}
                  style={{
                    backgroundColor: !isEditing ? "#ECF0F1" : "#FFF",
                    color: !isEditing ? "#7F8C8D" : "inherit",
                    borderColor: !isEditing ? "#E0E0E0" : "#4A90E2",
                    width: "40px",
                  }}
                >
                  <span style={{ pointerEvents: "none", fontSize: "14px" }}>
                    {isLoadingCountries ? "..." : countryCode}
                  </span>

                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={!isEditing || isLoadingCountries}
                    style={{
                      opacity: 0,
                      cursor: isEditing ? "pointer" : "default",
                    }}
                    className={styles.formInputPhoneNumberSelect}
                  >
                    {isLoadingCountries ? (
                      <option>Loading...</option>
                    ) : (
                      countryOptions.map((option, index) => (
                        <option key={index} value={option.code}>
                          {option.name} ({option.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <input
                  type="text"
                  name="phoneNumber"
                  className={styles.formInput}
                  style={{ flexGrow: 1 }}
                  placeholder={isEditing ? "812 xxxx xxxx" : ""}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Province */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Provinsi (Province)</label>
              <select
                name="province"
                className={`${styles.formInput} ${styles.dropdownInput} ${
                  !isEditing ? styles.readonly : ""
                }`}
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!isEditing}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Regency */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kabupaten (Regency)</label>
              <select
                name="regency"
                className={`${styles.formInput} ${styles.dropdownInput} ${
                  !isEditing ? styles.readonly : ""
                }`}
                value={selectedRegency}
                onChange={handleRegencyChange}
                disabled={!isEditing || !selectedProvince}
              >
                <option value="">
                  {selectedProvince
                    ? "Pilih Kabupaten"
                    : "Pilih provinsi terlebih dahulu"}
                </option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.text}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kecamatan (District)</label>
              <select
                name="district"
                className={`${styles.formInput} ${styles.dropdownInput} ${
                  !isEditing ? styles.readonly : ""
                }`}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!isEditing || !selectedRegency}
              >
                <option value="">
                  {selectedRegency
                    ? "Pilih Kecamatan"
                    : "Pilih kabupaten terlebih dahulu"}
                </option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Village/Kelurahan */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Kelurahan/Desa (Village)
              </label>
              <select
                name="village"
                className={`${styles.formInput} ${styles.dropdownInput} ${
                  !isEditing ? styles.readonly : ""
                }`}
                value={selectedVillage}
                onChange={handleVillageChange}
                disabled={!isEditing || !selectedDistrict}
              >
                <option value="">
                  {selectedDistrict
                    ? "Pilih Kelurahan/Desa"
                    : "Pilih kecamatan terlebih dahulu"}
                </option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Kode Pos - Dropdown */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kode Pos (Postal Code)</label>
              <select
                name="postalCode"
                className={`${styles.formInput} ${styles.dropdownInput} ${
                  !isEditing ? styles.readonly : ""
                }`}
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={!isEditing || postalCodes.length === 0}
              >
                <option value="">
                  {postalCodes.length > 0
                    ? "Pilih Kode Pos"
                    : formData.postalCode
                    ? formData.postalCode
                    : "Pilih kelurahan terlebih dahulu"}
                </option>
                {postalCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className={`${styles.formGroup} ${styles.addressGroup}`}>
              <label className={styles.formLabel}>Alamat (Address)</label>
              <textarea
                name="address"
                className={styles.formInput}
                value={formData.address}
                onChange={handleInputChange}
                readOnly={!isEditing}
                rows={1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
