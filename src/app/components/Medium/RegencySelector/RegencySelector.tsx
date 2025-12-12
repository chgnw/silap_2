"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaSync, FaChevronDown } from "react-icons/fa";
import { useLocationData } from "@/app/hooks/useLocationData";
import styles from "./regencySelector.module.css";

interface LocationItem {
  id: string;
  text: string;
}

interface RegencySelectorProps {
  value: string;
  onChange: (regency: string) => void;
  defaultFromProfile?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export default function RegencySelector({
  value,
  onChange,
  defaultFromProfile,
  disabled = false,
  label = "Wilayah Pickup",
  placeholder = "Pilih Wilayah",
}: RegencySelectorProps) {
  const locationData = useLocationData();

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Track manual selection and abort controller for geocoding
  const userManuallySelectedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const MAX_RETRIES = 5;
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      const data = await locationData.fetchProvinces();
      setProvinces(data);
    };
    loadProvinces();
  }, []);

  // Cleanup on unmount - cancel any ongoing geocoding
  useEffect(() => {
    return () => {
      cancelGeocodingRequest();
    };
  }, []);

  // Auto-detect or use profile default
  useEffect(() => {
    if (hasAutoDetected) return;

    const initializeLocation = async () => {
      // Priority 1: If value already set, do nothing
      if (value) {
        setHasAutoDetected(true);
        return;
      }

      // Priority 2: Use profile default
      if (defaultFromProfile) {
        onChange(defaultFromProfile);
        setHasAutoDetected(true);
        return;
      }

      // Priority 3: Try geolocation auto-detect
      await detectLocation();
      setHasAutoDetected(true);
    };

    initializeLocation();
  }, [defaultFromProfile, value, hasAutoDetected]);

  // Cancel any ongoing geocoding request and clear timeout
  const cancelGeocodingRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Detect location using browser geolocation + reverse geocoding
  const detectLocation = async (forceDetect = false, currentRetry = 0) => {
    // Skip if value already exists (unless forced by user click)
    if (value && !forceDetect) {
      return;
    }

    // Skip if user has manually selected a value (unless forced by button click)
    if (userManuallySelectedRef.current && !forceDetect) {
      return;
    }

    // If forced by user clicking the button, reset the manual selection flag and retry count
    if (forceDetect && currentRetry === 0) {
      userManuallySelectedRef.current = false;
      setRetryCount(0);
    }

    // Check if max retries reached
    if (currentRetry >= MAX_RETRIES) {
      setIsDetecting(false);
      setDetectionError(
        `Gagal mendeteksi lokasi setelah ${MAX_RETRIES}x percobaan. Silakan pilih wilayah secara manual.`
      );
      setRetryCount(0);
      return;
    }

    if (!navigator.geolocation) {
      if (!value) {
        setDetectionError("Geolocation tidak didukung browser Anda");
      }
      return;
    }

    // Cancel any previous geocoding request
    cancelGeocodingRequest();

    setIsDetecting(true);
    if (currentRetry > 0) {
      setDetectionError(`Mencoba ulang... (${currentRetry}/${MAX_RETRIES})`);
    } else {
      setDetectionError(null);
    }
    setRetryCount(currentRetry);

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set timeout for the entire operation
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current === abortController) {
        abortController.abort();
        console.warn(
          `Geocoding timeout after ${REQUEST_TIMEOUT / 1000}s, retrying...`
        );
        // Retry on timeout
        if (!userManuallySelectedRef.current) {
          detectLocation(forceDetect, currentRetry + 1);
        }
      }
    }, REQUEST_TIMEOUT);
    timeoutRef.current = timeoutId;

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: REQUEST_TIMEOUT,
            maximumAge: 300000, // Cache for 5 minutes
          });
        }
      );

      // Check if user manually selected while we were getting geolocation
      if (userManuallySelectedRef.current || abortController.signal.aborted) {
        clearTimeout(timeoutId);
        setIsDetecting(false);
        return;
      }

      const { latitude, longitude } = position.coords;

      // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id",
          },
          signal: abortController.signal,
        }
      );

      // Clear timeout on successful response
      clearTimeout(timeoutId);
      if (timeoutRef.current === timeoutId) {
        timeoutRef.current = null;
      }

      // Double check if user manually selected during fetch
      if (userManuallySelectedRef.current || abortController.signal.aborted) {
        setIsDetecting(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mendapatkan lokasi");
      }

      const data = await response.json();

      // Final check before setting value - if user manually selected, don't override
      if (userManuallySelectedRef.current || abortController.signal.aborted) {
        setIsDetecting(false);
        return;
      }

      // Extract city/regency from response
      // Nominatim returns: city, county, state, country
      const city =
        data.address?.city ||
        data.address?.county ||
        data.address?.municipality ||
        data.address?.town;

      if (city) {
        // Format to match Indonesian naming convention
        let formattedCity = city.toUpperCase();

        // Common transformations for Indonesian cities
        if (
          formattedCity.includes("JAKARTA") ||
          formattedCity.includes("KOTA ADMINISTRASI")
        ) {
          // Handle Jakarta special case
          if (formattedCity.includes("UTARA")) {
            formattedCity = "KOTA JAKARTA UTARA";
          } else if (formattedCity.includes("SELATAN")) {
            formattedCity = "KOTA JAKARTA SELATAN";
          } else if (formattedCity.includes("BARAT")) {
            formattedCity = "KOTA JAKARTA BARAT";
          } else if (formattedCity.includes("TIMUR")) {
            formattedCity = "KOTA JAKARTA TIMUR";
          } else if (formattedCity.includes("PUSAT")) {
            formattedCity = "KOTA JAKARTA PUSAT";
          }
        }

        // Success - clear error and reset retry count
        setDetectionError(null);
        setRetryCount(0);
        onChange(formattedCity);
      } else {
        // City not found - retry
        if (!value && !userManuallySelectedRef.current) {
          detectLocation(forceDetect, currentRetry + 1);
          return;
        }
      }
    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      if (timeoutRef.current === timeoutId) {
        timeoutRef.current = null;
      }

      // Ignore abort errors (timeout handled separately)
      if (error?.name === "AbortError") {
        return;
      }

      // Permission denied - don't retry
      if (error?.code === 1) {
        setIsDetecting(false);
        setDetectionError(
          "Izin lokasi ditolak. Silakan pilih wilayah secara manual."
        );
        setRetryCount(0);
        return;
      }

      // Log non-standard errors
      if (error?.code !== 2 && error?.code !== 3) {
        console.warn("Geolocation error:", error?.message || error);
      }

      // Retry on other errors
      if (!value && !userManuallySelectedRef.current) {
        detectLocation(forceDetect, currentRetry + 1);
        return;
      }
    } finally {
      // Only set detecting to false if we're not retrying
      if (abortControllerRef.current === abortController) {
        setIsDetecting(false);
        abortControllerRef.current = null;
      }
    }
  };

  // Handle province change
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    onChange(""); // Reset regency

    if (provinceId) {
      const data = await locationData.fetchRegencies(provinceId);
      setRegencies(data);
    } else {
      setRegencies([]);
    }
  };

  // Clear error when value is set
  useEffect(() => {
    if (value) {
      setDetectionError(null);
    }
  }, [value]);

  // Handle regency selection
  const handleRegencySelect = (regency: LocationItem) => {
    // Mark as manually selected and cancel any ongoing geocoding
    userManuallySelectedRef.current = true;
    cancelGeocodingRequest();

    setDetectionError(null);
    onChange(regency.text);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* Only show labelRow if label is provided */}
      {label && (
        <div className={styles.labelRow}>
          <FaMapMarkerAlt className={styles.icon} />
          <span className={styles.label}>{label}</span>
          <button
            type="button"
            className={styles.detectButton}
            onClick={() => detectLocation(true)}
            disabled={isDetecting || disabled}
            title="Deteksi lokasi otomatis"
          >
            <FaSync className={isDetecting ? styles.spinning : ""} />
            {isDetecting
              ? retryCount > 0
                ? `Retry ${retryCount}/${MAX_RETRIES}...`
                : "Mendeteksi..."
              : "Auto-detect"}
          </button>
        </div>
      )}

      {/* Only show error if no value is selected */}
      {detectionError && !value && (
        <span className={styles.errorText}>{detectionError}</span>
      )}

      <div className={styles.selectorContainer}>
        {/* Current Value Display / Dropdown Trigger */}
        <div
          className={`${styles.valueDisplay} ${
            disabled ? styles.disabled : ""
          }`}
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className={value ? styles.valueText : styles.placeholderText}>
            {value || placeholder}
          </span>
          <FaChevronDown
            className={`${styles.chevron} ${isDropdownOpen ? styles.open : ""}`}
          />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && !disabled && (
          <div className={styles.dropdown}>
            {/* Province Selector */}
            <div className={styles.dropdownSection}>
              <label className={styles.dropdownLabel}>Provinsi</label>
              <select
                className={styles.select}
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.text}
                  </option>
                ))}
              </select>
            </div>

            {/* Regency List */}
            {selectedProvince && (
              <div className={styles.dropdownSection}>
                <label className={styles.dropdownLabel}>Kota/Kabupaten</label>
                <div className={styles.regencyList}>
                  {regencies.length === 0 ? (
                    <div className={styles.loading}>Memuat...</div>
                  ) : (
                    regencies.map((r) => (
                      <div
                        key={r.id}
                        className={`${styles.regencyItem} ${
                          value === r.text ? styles.selected : ""
                        }`}
                        onClick={() => handleRegencySelect(r)}
                      >
                        {r.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quick Access for Jakarta */}
            {!selectedProvince && (
              <div className={styles.dropdownSection}>
                <label className={styles.dropdownLabel}>Akses Cepat</label>
                <div className={styles.quickAccess}>
                  {[
                    "KOTA JAKARTA UTARA",
                    "KOTA JAKARTA SELATAN",
                    "KOTA JAKARTA BARAT",
                    "KOTA JAKARTA TIMUR",
                    "KOTA JAKARTA PUSAT",
                  ].map((city) => (
                    <div
                      key={city}
                      className={`${styles.quickItem} ${
                        value === city ? styles.selected : ""
                      }`}
                      onClick={() => {
                        // Mark as manually selected and cancel any ongoing geocoding
                        userManuallySelectedRef.current = true;
                        cancelGeocodingRequest();

                        setDetectionError(null);
                        onChange(city);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
