"use client"

import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

import { showToast } from "@/lib/toastHelper"; 
import styles from './profile.module.css';

interface Wilayah {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [regencies, setRegencies] = useState<Wilayah[]>([]);
  const [districts, setDistricts] = useState<Wilayah[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [countryCode, setCountryCode] = useState('+62');
  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    province: '',
    regency: '',
    subdistrict: '',
    address: '',
    postalCode: '',
    wasteTarget: '0.00',
    points: 0,
    currentStreak: 0,
    tierName: ''
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user;
      const initialData = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        province: user.province || '',
        regency: user.regency || '',
        subdistrict: user.subdistrict || '',
        address: user.address || '',
        postalCode: user.postal_code || '0',
        wasteTarget: user.waste_target?.toString() || '0',
        points: user.points || 0,
        currentStreak: user.current_streak || 0,
        tierName: user.tier_list_name || 'Eco Starter'
      };
      
      setUserData(initialData);
      setFormData(initialData);

      // Pre-select location dropdowns if data exists
      const initializeLocation = async () => {
        try {
          if (initialData.province) {
            const provinceRes = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
            const provincesData: Wilayah[] = await provinceRes.json();
            setProvinces(provincesData);

            const currentProvince = provincesData.find(p => p.name === initialData.province);
            if (currentProvince) {
              setSelectedProvince(currentProvince.id);

              if (initialData.regency) {
                const regencyRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${currentProvince.id}.json`);
                const regenciesData: Wilayah[] = await regencyRes.json();
                setRegencies(regenciesData);

                const currentRegency = regenciesData.find(r => r.name === initialData.regency);
                if (currentRegency) {
                  setSelectedRegency(currentRegency.id);

                  if (initialData.subdistrict) {
                    const districtRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${currentRegency.id}.json`);
                    const districtsData: Wilayah[] = await districtRes.json();
                    setDistricts(districtsData);

                    const currentDistrict = districtsData.find(d => d.name === initialData.subdistrict);
                    if (currentDistrict) {
                      setSelectedDistrict(currentDistrict.id);
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to initialize location data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeLocation();
    }
  }, [session, status]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
        const data = await res.json();

        const formatted = data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => ({
            name: c.name.common,
            code: `${c.idd.root}${c.idd.suffixes ? c.idd.suffixes[0] : ''}`,
            cca2: c.cca2
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountryOptions(formatted);
      } catch (err) {
        console.error("Gagal ambil data negara, fallback manual", err);
        setCountryOptions([{ name: 'Indonesia', code: '+62' }]); 
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (userData.phoneNumber && countryOptions.length > 0) {
      const sortedOptions = [...countryOptions].sort((a, b) => b.code.length - a.code.length);
      
      const found = sortedOptions.find(c => userData.phoneNumber.startsWith(c.code));

      if (found) {
        setCountryCode(found.code);
        const localNumber = userData.phoneNumber.substring(found.code.length);
        
        setFormData(prev => ({ ...prev, phoneNumber: localNumber }));
      }
    }
  }, [userData.phoneNumber, countryOptions]);

  const handleEdit = () => {
    setIsEditing(true);

    // Ambil dari API kalau belom ada (biar gak boros resources hit API terus)
    if (provinces.length === 0) {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then(res => res.json())
        .then(data => setProvinces(data))
        .catch(err => console.error("Failed loading provinces:", err));
    }
  };

  const handleProvinceChange = (e: any) => {
    const provId = e.target.value;
    const province = provinces.find((p) => p.id === provId);

    setSelectedProvince(provId);
    setSelectedRegency('');
    setSelectedDistrict('');

    setFormData(prev => ({
      ...prev,
      province: province ? province.name : '',
      regency: '',
      subdistrict: ''
    }));

    // Kalau udah ada provinsi yang dipilih, ambil data kabupaten
    if (provId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
        .then(res => res.json())
        .then(data => setRegencies(data));
    }
  };

  const handleRegencyChange = (e: any) => {
    const regId = e.target.value;
    const regency = regencies.find((r) => r.id === regId);

    setSelectedRegency(regId);
    setSelectedDistrict('');

    setFormData(prev => ({
      ...prev,
      regency: regency ? regency.name : '',
      subdistrict: ''
    }));

    // Fetch districts
    if (regId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regId}.json`)
        .then(res => res.json())
        .then(data => setDistricts(data));
    }
  };

  const handleDistrictChange = (e: any) => {
    const distId = e.target.value;
    const district = districts.find((d) => d.id === distId);
    setSelectedDistrict(distId);
    setFormData(prev => ({ ...prev, subdistrict: district ? district.name : '' }));
  };


  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);

    // Re-initialize location dropdowns to their original state
    const resetLocation = async () => {
      try {
        if (userData.province && provinces.length > 0) {
          const originalProvince = provinces.find(p => p.name === userData.province);
          if (originalProvince) {
            setSelectedProvince(originalProvince.id);

            if (userData.regency) {
              const regencyRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${originalProvince.id}.json`);
              const regenciesData: Wilayah[] = await regencyRes.json();
              setRegencies(regenciesData);
              const originalRegency = regenciesData.find(r => r.name === userData.regency);

              if (originalRegency) {
                setSelectedRegency(originalRegency.id);

                if (userData.subdistrict) {
                  const districtRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${originalRegency.id}.json`);
                  const districtsData: Wilayah[] = await districtRes.json();
                  setDistricts(districtsData);
                  const originalDistrict = districtsData.find(d => d.name === userData.subdistrict);
                  if (originalDistrict) setSelectedDistrict(originalDistrict.id);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to reset location data:", error);
      }
    };

    resetLocation();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, '');

    if (val.startsWith('0')) val = val.substring(1);

    const codeOnly = countryCode.replace('+', '');
    if (val.startsWith(codeOnly)) val = val.substring(codeOnly.length);

    setFormData(prev => ({ ...prev, phoneNumber: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // console.log("data yang dikirim untuk di update: ", formData);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Format email tidak valid! (contoh: user@email.com)");
      return;
    }
    
    if (formData.phoneNumber.length < 9 || formData.phoneNumber.length > 15) {
      alert("Nomor telepon tidak valid (minimal 9 angka).");
      return;
    }

    const fullPhoneNumber = `${countryCode} ${formData.phoneNumber}`;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          postalCode: formData.postalCode,
          province: formData.province,
          regency: formData.regency,
          subdistrict: formData.subdistrict,
          phoneNumber: fullPhoneNumber,
          address: formData.address,
          wasteTarget: parseFloat(formData.wasteTarget)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }
      
      const result = await response.json();
      if(result.updated) {
        await update();
        showToast(result.updated, "Profile updated successfully!")
      }

      if (result.updated) {
        setUserData({ ...formData, phoneNumber: fullPhoneNumber });
        setIsEditing(false);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred.');
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>My Profile</h1>
        <div className={styles.actionButtons}>
          {!isEditing ? (
            <button className={`${styles.btn} ${styles.btnEdit}`} onClick={handleEdit}>
              <FaPencilAlt /> Edit Profile
            </button>
          ) : (
            <>
              <button 
                className={`${styles.btn} ${styles.btnSave}`}
                onClick={handleSave}
                disabled={isSaving}
              >
                <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={handleCancel}
                disabled={isSaving}
              >
                <FaTimes /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileSidebar}>
          <div className={styles.profileAvatar}>
            {userData.firstName.charAt(0)}{userData.lastName?.charAt(0) || ''}
          </div>
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Points</div>
              <div className={styles.statValue}>{userData.points.toLocaleString()}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Current Streak</div>
              <div className={styles.statValue}>{userData.currentStreak} days</div>
            </div>
          </div>
        </div>

        <div className={styles.profileMain}>
          <div className={styles.formGrid}>
            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Depan (First Name)</label>
              <input
                type="text"
                name="firstName"
                className={`${styles.formInput}`}
                value={formData.firstName}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Belakang (Last Name)</label>
              <input
                type="text"
                name="lastName"
                className={`${styles.formInput}`}
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
                className={`${styles.formInput}`}
                value={formData.email}
                readOnly
              />
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>No. Telp (Phone Number)</label>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div 
                  className={styles.formInput} 
                  style={{ 
                    position: 'relative', 
                    width: '100px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    overflow: 'hidden',
                    backgroundColor: !isEditing ? '#ECF0F1' : '#FFF',
                    color: !isEditing ? '#7F8C8D' : 'inherit',
                    borderColor: !isEditing ? '#E0E0E0' : '#4A90E2'
                  }}
                >
                  <span style={{ pointerEvents: 'none', fontSize: '14px' }}>
                    {isLoadingCountries ? '...' : countryCode}
                  </span>
                  
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={!isEditing || isLoadingCountries}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      opacity: 0,
                      cursor: isEditing ? 'pointer' : 'default'
                    }}
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

            {/* Kode Pos */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kode Pos (Postal Code)</label>
              <input
                type="text"
                name="postalCode"
                className={`${styles.formInput}`}
                value={formData.postalCode}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>

            {/* Waste Target */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Waste Target (kg)</label>
              <input
                type="number"
                name="wasteTarget"
                className={`${styles.formInput}`}
                value={formData.wasteTarget}
                onChange={handleInputChange}
                readOnly={!isEditing}
                step="0.01"
                min="0"
              />
            </div>

            {/* Province */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Provinsi (Province)</label>
              <select
                name="province"
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!isEditing}
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Regency */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kabupaten (Regency)</label>
              <select
                name="regency"
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={selectedRegency}
                onChange={handleRegencyChange}
                disabled={!isEditing || !selectedProvince}
              >
                <option value="">{selectedProvince ? 'Select Regency' : 'Please select province to select regency.'}</option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option> 
                ))}
              </select>
            </div>

            {/* District */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kecamatan (District)</label>
              <select
                name="district"
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!isEditing || !selectedRegency}
              >
                <option value="">{selectedRegency ? 'Select District' : 'Please select regency to select district.'}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className={`${styles.formGroup} ${styles.addressGroup}`}>
              <label className={styles.formLabel}>Alamat (Address)</label>
              <textarea
                name="address"
                className={`${styles.formInput}`}
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