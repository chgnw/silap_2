"use client"

import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

import { showToast } from "@/lib/toastHelper"; 
import styles from './profile.module.css';

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [postalCodes, setPostalCodes] = useState<string[]>([]);

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
    village: '',
    address: '',
    postalCode: '',
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
        village: user.village || '',
        address: user.address || '',
        postalCode: user.postal_code || '',
        points: user.points || 0,
        currentStreak: user.current_streak || 0,
        tierName: user.tier_list_name || 'Eco Starter'
      };
      
      setUserData(initialData);
      setFormData(initialData);
      
      const initializeLocation = async () => {
        try {
          if (initialData.province) {
            const provinceRes = await fetch("https://alamat.thecloudalert.com/api/provinsi/get/");
            const provinceData = await provinceRes.json();
            
            if (provinceData.status === 200 && provinceData.result) {
              setProvinces(provinceData.result);

              const currentProvince = provinceData.result.find((p: LocationItem) => p.text === initialData.province);
              if (currentProvince) {
                setSelectedProvince(currentProvince.id);

                if (initialData.regency) {
                  const regencyRes = await fetch(`https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${currentProvince.id}`);
                  const regencyData = await regencyRes.json();
                  
                  if (regencyData.status === 200 && regencyData.result) {
                    setRegencies(regencyData.result);

                    const currentRegency = regencyData.result.find((r: LocationItem) => r.text === initialData.regency);
                    if (currentRegency) {
                      setSelectedRegency(currentRegency.id);

                      if (initialData.subdistrict) {
                        const districtRes = await fetch(`https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${currentRegency.id}`);
                        const districtData = await districtRes.json();
                        
                        if (districtData.status === 200 && districtData.result) {
                          setDistricts(districtData.result);

                          const currentDistrict = districtData.result.find((d: LocationItem) => d.text === initialData.subdistrict);
                          if (currentDistrict) {
                            setSelectedDistrict(currentDistrict.id);

                            if (initialData.village) {
                              const villageRes = await fetch(`https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${currentDistrict.id}`);
                              const villageData = await villageRes.json();
                              
                              if (villageData.status === 200 && villageData.result) {
                                setVillages(villageData.result);

                                const currentVillage = villageData.result.find((v: LocationItem) => v.text === initialData.village);
                                if (currentVillage) {
                                  setSelectedVillage(currentVillage.id);
                                  
                                  // Fetch postal codes for existing village
                                  if (initialData.postalCode) {
                                    try {
                                      const searchRes = await fetch(
                                        `https://alamat.thecloudalert.com/api/cari/index/?keyword=${encodeURIComponent(initialData.village)}`
                                      );
                                      const searchData = await searchRes.json();
                                      
                                      if (searchData.status === 200 && searchData.result && searchData.result.length > 0) {
                                        const matchedResults = searchData.result.filter((item: SearchResult) => 
                                          item.provinsi === initialData.province &&
                                          item.kabkota === initialData.regency &&
                                          item.kecamatan === initialData.subdistrict &&
                                          item.desakel === initialData.village
                                        );
                                        
                                        if (matchedResults.length > 0) {
                                          const postalCodesArray = matchedResults.map((item: SearchResult) => item.kodepos);
                                          const uniquePostalCodes: string[] = [...new Set<string>(postalCodesArray)];
                                          setPostalCodes(uniquePostalCodes);
                                        }
                                      }
                                    } catch (error) {
                                      console.error("Failed to fetch initial postal codes:", error);
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

    if (provinces.length === 0) {
      fetch("https://alamat.thecloudalert.com/api/provinsi/get/")
        .then(res => res.json())
        .then(data => {
          if (data.status === 200 && data.result) {
            setProvinces(data.result);
          }
        })
        .catch(err => console.error("Failed loading provinces:", err));
    }
  };

  const handleProvinceChange = async (e: any) => {
    const provId = e.target.value;
    const province = provinces.find((p) => p.id === provId);

    setSelectedProvince(provId);
    setSelectedRegency('');
    setSelectedDistrict('');
    setSelectedVillage('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    setFormData(prev => ({
      ...prev,
      province: province ? province.text : '',
      regency: '',
      subdistrict: '',
      village: '',
      postalCode: ''
    }));

    if (provId) {
      try {
        const res = await fetch(`https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${provId}`);
        const data = await res.json();
        if (data.status === 200 && data.result) {
          setRegencies(data.result);
        }
      } catch (err) {
        console.error("Failed loading regencies:", err);
      }
    }
  };

  const handleRegencyChange = async (e: any) => {
    const regId = e.target.value;
    const regency = regencies.find((r) => r.id === regId);

    setSelectedRegency(regId);
    setSelectedDistrict('');
    setSelectedVillage('');
    setDistricts([]);
    setVillages([]);
    setPostalCodes([]);
    setPostalCodes([]);

    setFormData(prev => ({
      ...prev,
      regency: regency ? regency.text : '',
      subdistrict: '',
      village: '',
      postalCode: ''
    }));

    if (regId) {
      try {
        const res = await fetch(`https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${regId}`);
        const data = await res.json();
        if (data.status === 200 && data.result) {
          setDistricts(data.result);
        }
      } catch (err) {
        console.error("Failed loading districts:", err);
      }
    }
  };

  const handleDistrictChange = async (e: any) => {
    const distId = e.target.value;
    const district = districts.find((d) => d.id === distId);
    
    setSelectedDistrict(distId);
    setSelectedVillage('');
    setVillages([]);
    setPostalCodes([]);

    setFormData(prev => ({ 
      ...prev, 
      subdistrict: district ? district.text : '',
      village: '',
      postalCode: ''
    }));

    if (distId) {
      try {
        const res = await fetch(`https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${distId}`);
        const data = await res.json();
        if (data.status === 200 && data.result) {
          setVillages(data.result);
        }
      } catch (err) {
        console.error("Failed loading villages:", err);
      }
    }
  };

  const handleVillageChange = async (e: any) => {
    const villageId = e.target.value;
    const village = villages.find((v) => v.id === villageId);
    
    setSelectedVillage(villageId);
    setFormData(prev => ({ 
      ...prev, 
      village: village ? village.text : '',
      postalCode: ''
    }));
    setPostalCodes([]);

    if (village && formData.province && formData.regency && formData.subdistrict) {
      try {
        const searchRes = await fetch(
          `https://alamat.thecloudalert.com/api/cari/index/?keyword=${encodeURIComponent(village.text)}`
        );
        const searchData = await searchRes.json();
        
        if (searchData.status === 200 && searchData.result && searchData.result.length > 0) {
          const matchedResults = searchData.result.filter((item: SearchResult) => 
            item.provinsi === formData.province &&
            item.kabkota === formData.regency &&
            item.kecamatan === formData.subdistrict &&
            item.desakel === village.text
          );
          
          if (matchedResults.length > 0) {
            const postalCodesArray = matchedResults.map((item: SearchResult) => item.kodepos);
            const uniquePostalCodes: string[] = [...new Set<string>(postalCodesArray)];
            setPostalCodes(uniquePostalCodes);
            
            if (uniquePostalCodes.length === 1) {
              setFormData(prev => ({ ...prev, postalCode: uniquePostalCodes[0] }));
            }
          } else {
            console.warn("No exact match found for this location");
          }
        } else {
          console.warn("No search results found");
        }
      } catch (error) {
        console.error("Failed to fetch postal codes:", error);
      }
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);

    const resetLocation = async () => {
      try {
        if (userData.province && provinces.length > 0) {
          const originalProvince = provinces.find(p => p.text === userData.province);
          if (originalProvince) {
            setSelectedProvince(originalProvince.id);

            if (userData.regency) {
              const regencyRes = await fetch(`https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${originalProvince.id}`);
              const regencyData = await regencyRes.json();
              
              if (regencyData.status === 200 && regencyData.result) {
                setRegencies(regencyData.result);
                const originalRegency = regencyData.result.find((r: LocationItem) => r.text === userData.regency);

                if (originalRegency) {
                  setSelectedRegency(originalRegency.id);

                  if (userData.subdistrict) {
                    const districtRes = await fetch(`https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${originalRegency.id}`);
                    const districtData = await districtRes.json();
                    
                    if (districtData.status === 200 && districtData.result) {
                      setDistricts(districtData.result);
                      const originalDistrict = districtData.result.find((d: LocationItem) => d.text === userData.subdistrict);
                      
                      if (originalDistrict) {
                        setSelectedDistrict(originalDistrict.id);

                        if (userData.village) {
                          const villageRes = await fetch(`https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${originalDistrict.id}`);
                          const villageData = await villageRes.json();
                          
                          if (villageData.status === 200 && villageData.result) {
                            setVillages(villageData.result);
                            const originalVillage = villageData.result.find((v: LocationItem) => v.text === userData.village);
                            if (originalVillage) {
                              setSelectedVillage(originalVillage.id);
                              
                              if (userData.postalCode) {
                                try {
                                  const searchRes = await fetch(
                                    `https://alamat.thecloudalert.com/api/cari/index/?keyword=${encodeURIComponent(userData.village)}`
                                  );
                                  const searchData = await searchRes.json();
                                  
                                  if (searchData.status === 200 && searchData.result && searchData.result.length > 0) {
                                    const matchedResults = searchData.result.filter((item: SearchResult) => 
                                      item.provinsi === userData.province &&
                                      item.kabkota === userData.regency &&
                                      item.kecamatan === userData.subdistrict &&
                                      item.desakel === userData.village
                                    );
                                    
                                    if (matchedResults.length > 0) {
                                      const postalCodesArray = matchedResults.map((item: SearchResult) => item.kodepos);
                                      const uniquePostalCodes: string[] = [...new Set<string>(postalCodesArray)];
                                      setPostalCodes(uniquePostalCodes);
                                    }
                                  }
                                } catch (error) {
                                  console.error("Failed to re-fetch postal codes:", error);
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Format email tidak valid! (contoh: user@email.com)");
      setIsSaving(false);
      return;
    }
    
    if (formData.phoneNumber.length < 9 || formData.phoneNumber.length > 15) {
      alert("Nomor telepon tidak valid.");
      setIsSaving(false);
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
          village: formData.village,
          phoneNumber: fullPhoneNumber,
          address: formData.address
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
                <FaSave /> {isSaving ? 'Saving..' : 'Save'}
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
              
              <div className={styles.formInputPhoneNumberContainer}>
                <div 
                  className={`${styles.formInput} ${styles.formInputPhoneNumber}`}
                  style={{
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
                      opacity: 0,
                      cursor: isEditing ? 'pointer' : 'default'
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
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!isEditing}
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.text}</option>
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
                <option value="">{selectedProvince ? 'Select Regency' : 'Select province first'}</option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>{r.text}</option> 
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
                <option value="">{selectedRegency ? 'Select District' : 'Select regency first'}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.text}</option>
                ))}
              </select>
            </div>

            {/* Village/Kelurahan */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kelurahan/Desa (Village)</label>
              <select
                name="village"
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={selectedVillage}
                onChange={handleVillageChange}
                disabled={!isEditing || !selectedDistrict}
              >
                <option value="">{selectedDistrict ? 'Select Village' : 'Select district first'}</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>{v.text}</option>
                ))}
              </select>
            </div>

            {/* Kode Pos - Dropdown */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kode Pos (Postal Code)</label>
              <select
                name="postalCode"
                className={`${styles.formInput} ${styles.dropdownInput} ${!isEditing ? styles.readonly : ''}`}
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={!isEditing || postalCodes.length === 0}
              >
                <option value="">{postalCodes.length > 0 ? 'Select Postal Code' : (formData.postalCode ? formData.postalCode : 'Select village first')}</option>
                {postalCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
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