"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { showToast } from "@/lib/toastHelper";
import style from "./pickup.module.css";
import RegencySelector from "@/app/components/Medium/RegencySelector/RegencySelector";
import PickupConfirmModal from "@/app/components/Medium/PickupConfirmModal/PickupConfirmModal";

const Calendar = dynamic(
  () => import("@/app/components/Large/Calendar/Calendar"),
  {
    ssr: false,
    loading: () => (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading calendar...
      </div>
    ),
  }
);

import {
  FaArrowUp,
  FaTruck,
  FaCalendarAlt,
  FaClock,
  FaMousePointer,
  FaCamera,
  FaStickyNote,
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { GiWeight } from "react-icons/gi";
import { MdArrowForwardIos } from "react-icons/md";

interface OptionItem {
  id: string | number;
  name: string;
  max_weight: string;
}

interface AddressData {
  user_id: string | number;
  name: string;
  phone: string;
  address: string;
  regency?: string;
}

export default function PickUpPage() {
  const { data: session, status } = useSession();

  /*
    Session check
    kalau gak ada, suruh login dulu
    tiap page yang diharuskan untuk login harus ada ini
  */
  const router = useRouter();
  useEffect(() => {
    if (!session) router.push("/login");
  }, [session]);

  // Data
  const [vehicleOptions, setVehicleOptions] = useState<OptionItem[]>([]);
  const [pickupOptions, setPickupOptions] = useState<OptionItem[]>([]);
  const [addressData, setAddressData] = useState<AddressData>({
    user_id: "",
    name: "",
    phone: "",
    address: "",
  });

  // State & Input User
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [weight, setWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [showPickupTypeDropdown, setShowPickupTypeDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<OptionItem | null>(
    null
  );
  const [selectedPickupType, setSelectedPickupType] =
    useState<OptionItem | null>(null);

  // Image & Notes
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Regency & Confirmation Modal
  const [pickupRegency, setPickupRegency] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Flag
  const [refreshKey, setRefreshKey] = useState(0);
  const maxCapacity =
    vehicleOptions.length > 0
      ? Math.max(...vehicleOptions.map((v) => parseFloat(v.max_weight)))
      : 0;
  const currentWeightNum = parseFloat(weight) || 0;
  const isTotalOverload = currentWeightNum > maxCapacity;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minTime, setMinTime] = useState("");

  /*
    Function untuk nentuin vehicle based on weight 
  */
  useEffect(() => {
    const beratInput = parseFloat(weight);
    if (!beratInput || isNaN(beratInput) || vehicleOptions.length === 0) return;

    const sortedVehicles = [...vehicleOptions].sort(
      (a: any, b: any) => a.max_weight - b.max_weight
    );

    let cocok = sortedVehicles.find((v: any) => beratInput <= v.max_weight);
    if (!cocok) {
      cocok = sortedVehicles[sortedVehicles.length - 1];
    }

    if (cocok && selectedVehicle?.id !== cocok.id) {
      setSelectedVehicle(cocok);
    }
  }, [weight, vehicleOptions]);

  /*
    Ref function untuk munculin input date
  */
  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  /*
    Ref function untuk munculin input hour
  */
  const openTimePicker = () => {
    if (timeInputRef.current) {
      timeInputRef.current.showPicker();
    }
  };

  /*
    Function untuk dapetin day hari ini
    tujuannya untuk dipake di minDate untuk inputan tanggal
  */
  const getTodayString = () => {
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const minDate = getTodayString();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setAddressData({
        user_id: session.user.id,
        name:
          `${session.user.first_name} ${session.user.last_name}` || "Username",
        phone: session.user.phone_number || "-",
        address:
          session.user.address ||
          "Masukkan alamat pengiriman atau atur alamat pada menu profile.",
        regency: session.user.regency || "",
      });
      // Set default regency from profile if available
      if (session.user.regency) {
        setPickupRegency(session.user.regency);
      }
    }
  }, [session, status]);

  // Ambil data untuk pickup type, dll untuk dropdown
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const response = await fetch("/api/dashboard/pickup/get-initial-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      // console.log("Raw API Response:", result);

      const vehicles = result.data?.vehicleType || [];
      const pickups = result.data?.pickupType || [];

      setVehicleOptions(vehicles);
      setPickupOptions(pickups);
      // console.log("Data yang akan di-set:", vehicles, pickups);

      if (vehicles.length > 0 && !weight) {
        setSelectedVehicle(vehicles[0]);
      }

      if (pickups.length > 1) {
        setSelectedPickupType(pickups[1]);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleAddressChange = (e: any) => {
    setAddressData({ ...addressData, address: e.target.value });
  };

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDropdown(false);
  };

  const handleSelectPickupType = (option: any) => {
    setSelectedPickupType(option);
    setShowPickupTypeDropdown(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        showToast("error", "Format gambar harus PNG, JPG, atau JPEG");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showToast("error", "Ukuran gambar maksimal 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const insertNewEvent = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/dashboard/pickup/add-new-event", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("result: ", result);
      if (response.status === 409) {
        showToast(
          response.status,
          "Event pada hari dan jam tersebut sudah ada."
        );
        return;
      }

      if (response.status === 500) {
        showToast(
          response.status,
          "Terjadi kesalahan server. Silakan coba lagi."
        );
        return;
      }

      if (!response.ok) {
        showToast(
          response.status,
          result.details || "Terjadi kesalahan saat menambahkan jadwal."
        );
        return;
      }

      if (response.status === 200 && result.message === "SUCCESS") {
        // Close confirmation modal
        setShowConfirmModal(false);

        // Reset input
        setWeight("");
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
        setSelectedImage(null);
        setImagePreview("");
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
        setShowVehicleDropdown(false);
        setShowPickupTypeDropdown(false);
        if (vehicleOptions.length > 0) {
          setSelectedVehicle(vehicleOptions[0]);
        }
        if (pickupOptions.length > 0) {
          setSelectedPickupType(pickupOptions[0]);
        }
        setIsEditingAddress(false);
        // Reset regency to profile default
        if (session?.user?.regency) {
          setPickupRegency(session.user.regency);
        }

        showToast(response.status, "Jadwal penjemputan berhasil ditambahkan!");
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error inserting new event:", error);
      showToast(
        "error",
        "Gagal terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 
    Function untuk dapetin jam sekarang
    berguna buat set min di input hour
  */
  useEffect(() => {
    updateMinTime();

    const interval = setInterval(() => {
      updateMinTime();
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const updateMinTime = () => {
    const now = new Date();
    const jakartaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const selectedDateObj = new Date(selectedDate);
    const isToday =
      selectedDateObj.toDateString() === jakartaTime.toDateString();

    if (isToday) {
      const hours = jakartaTime.getHours().toString().padStart(2, "0");
      const minutes = jakartaTime.getMinutes().toString().padStart(2, "0");
      setMinTime(`${hours}:${minutes}`);
    } else {
      setMinTime("00:00");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTimeValue = e.target.value;

    if (minTime && selectedTimeValue < minTime) {
      showToast("error", "Waktu tidak boleh lebih kecil dari jam sekarang");
      return;
    }

    setSelectedTime(selectedTimeValue);
  };

  const handleSubmit = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      weight === "" ||
      !selectedPickupType ||
      !selectedVehicle
    ) {
      showToast("error", "Mohon lengkapi informasi penjemputan sampah.");
      return;
    }

    if (!pickupRegency) {
      showToast("error", "Mohon pilih wilayah pickup.");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add all the data
    formData.append("userData", JSON.stringify(addressData));
    formData.append("weight", weight);
    formData.append("vehicle", JSON.stringify(selectedVehicle));
    formData.append("date", selectedDate);
    formData.append("time", selectedTime);
    formData.append("pickupType", JSON.stringify(selectedPickupType));
    formData.append("notes", notes);
    formData.append("pickupRegency", pickupRegency);

    // Add image if selected
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    console.log("DATA SIAP DIKIRIM (FormData)");
    insertNewEvent(formData);
  };

  if (status === "loading") {
    return <div className={style.loadingState}>Memuat data pengiriman...</div>;
  }

  return (
    <div className={style.detailContainer}>
      <div className={style.leftSide}>
        <h1 className={style.leftSideHeader}>Detail Pengiriman</h1>

        {/* Alamat */}
        <div className={style.detailCard}>
          <div className={`${style.iconBox}`}>
            <FaArrowUp style={{ color: "#FFFFFF" }} />
          </div>

          <div className={style.cardContentRow}>
            <div className={style.senderHeader}>
              <h1 className={style.senderName}>{addressData.name}</h1>
              <div className={style.addressContainer}>
                <span className={style.phoneBadge}>{addressData.phone}</span>
              </div>
            </div>

            {isEditingAddress ? (
              <textarea
                className={style.addressInput}
                value={addressData.address}
                onChange={handleAddressChange}
                rows={3}
                autoFocus
              />
            ) : (
              <p className={style.addressText}>{addressData.address}</p>
            )}
          </div>

          {/* Tombol Edit */}
          <div
            className={style.chevron}
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            title={isEditingAddress ? "Simpan Perubahan" : "Ubah Alamat"}
          >
            {isEditingAddress ? (
              <FaCheck style={{ color: "#2F5E44" }} size={16} />
            ) : (
              <FiEdit style={{ color: "#2F5E44" }} size={16} />
            )}
          </div>
        </div>

        {/* Wilayah Pickup */}
        <div
          className={style.detailCard}
          style={{ flexDirection: "column", alignItems: "stretch" }}
        >
          <RegencySelector
            value={pickupRegency}
            onChange={setPickupRegency}
            defaultFromProfile={addressData.regency}
          />
        </div>

        {/* Berat */}
        <div className={`${style.detailCard} ${style.weightCard}`}>
          <div className={style.headerTitleGroup}>
            <div className={`${style.iconBox}`}>
              <GiWeight style={{ color: "#FFFFFF" }} />
            </div>
            <span className={style.headerTitle}>Total Berat</span>
          </div>

          <div className={style.inputWrapper}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={style.weightInput}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
            />
            <span className={style.unitLabel}>Kg</span>
          </div>
        </div>

        {/* Armada Pickup */}
        <div className={`${style.detailCard} ${style.armadaCard}`}>
          <div className={style.cardHeaderTop}>
            <div className={style.headerTitleGroup}>
              <div className={`${style.iconBox} ${style.iconDarkGreen}`}>
                <FaTruck style={{ color: "#FFFFFF" }} />
              </div>
              <span className={style.headerTitle}>Armada</span>
            </div>

            <div
              className={style.actionLink}
              onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
            >
              {showVehicleDropdown ? <span>Tutup</span> : <span>Pilih</span>}
              <MdArrowForwardIos
                style={{
                  transform: showVehicleDropdown
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "0.3s",
                }}
              />
            </div>
          </div>

          {!showVehicleDropdown && (
            <div
              className={style.cardBodyVehicle}
              // Styling tambahan jika Overload (Background merah muda & border merah)
              style={{
                backgroundColor: isTotalOverload ? "#FFFFFF" : undefined,
                border: isTotalOverload ? "1px solid #ED1C24" : undefined,
                cursor: isTotalOverload ? "not-allowed" : "pointer",
              }}
            >
              {/* Radio button disembunyikan jika error, biar bersih */}
              {!isTotalOverload && (
                <input
                  type="radio"
                  checked={true}
                  readOnly
                  className={style.vehicleRadio}
                />
              )}

              {/* Ganti Icon Kendaraan jadi Tanda Seru jika Overload */}
              <div className={style.vehicleImgPlaceholder}>
                {
                  isTotalOverload
                    ? "⚠️"
                    : selectedVehicle?.id === 1
                    ? "🛵"
                    : "🛻" // Sesuaikan logic icon kamu
                }
              </div>

              {/* Bagian Teks */}
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <span
                  className={style.vehicleName}
                  style={{ color: isTotalOverload ? "#ED1C24" : "inherit" }}
                >
                  {isTotalOverload
                    ? "Armada Tidak Tersedia"
                    : selectedVehicle?.name}
                </span>

                {/* Tampilkan pesan error jika Overload */}
                {isTotalOverload && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#ED1C24",
                      marginTop: "2px",
                    }}
                  >
                    Berat melebihi batas maks. {maxCapacity}kg.
                  </span>
                )}
              </div>
            </div>
          )}

          {showVehicleDropdown && (
            <div className={style.vehicleOptionsList}>
              {vehicleOptions.map((vehicle) => {
                const currentWeight = parseFloat(weight) || 0;
                const vehicleLimit = parseFloat(vehicle.max_weight);
                const isOverweight = currentWeight > vehicleLimit;

                return (
                  <div
                    key={vehicle.id}
                    className={`${style.vehicleOptionItem} ${
                      selectedVehicle?.id === vehicle.id
                        ? style.activeOption
                        : ""
                    }`}
                    style={{
                      opacity: isOverweight ? 0.5 : 1,
                      cursor: isOverweight ? "not-allowed" : "pointer",
                      pointerEvents: isOverweight ? "none" : "auto",
                    }}
                    onClick={() => {
                      if (!isOverweight) {
                        handleSelectVehicle(vehicle);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      checked={selectedVehicle?.id === vehicle.id}
                      readOnly
                      className={style.vehicleRadio}
                      disabled={isOverweight}
                    />

                    <div className={style.vehicleImgPlaceholderSmall}>
                      {vehicle.name.toLowerCase().includes("motor")
                        ? "🛵"
                        : "🛻"}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={style.vehicleName}>{vehicle.name}</span>

                      {isOverweight && (
                        <span style={{ fontSize: "10px", color: "#ED1C24" }}>
                          Maksimal {vehicle.max_weight}kg
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Date */}
        <div
          className={`${style.detailCard} ${style.dateCard}`}
          onClick={openDatePicker}
          style={{ cursor: "pointer" }}
        >
          <div className={style.headerTitleGroup}>
            <div className={style.iconBox}>
              <FaCalendarAlt style={{ color: "#FFFFFF" }} />
            </div>
            <span className={style.headerTitle}>Pilih Tanggal</span>
          </div>

          <div className={style.actionLink} style={{ position: "relative" }}>
            <span>{selectedDate ? selectedDate : "Pilih"}</span>

            <MdArrowForwardIos />

            <input
              min={minDate}
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                visibility: "hidden",
                position: "absolute",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Time */}
        <div
          className={`${style.detailCard} ${style.timeCard}`}
          onClick={openTimePicker}
          style={{ cursor: "pointer" }}
        >
          <div className={style.headerTitleGroup}>
            <div className={style.iconBox}>
              <FaClock style={{ color: "#FFFFFF" }} />
            </div>
            <span className={style.headerTitle}>Pilih Jam</span>
          </div>

          <div
            className={style.actionLink}
            style={{ position: "relative", cursor: "pointer" }}
          >
            <span>{selectedTime ? selectedTime : "Pilih"}</span>
            <MdArrowForwardIos />

            <input
              ref={timeInputRef}
              type="time"
              value={selectedTime}
              min={minTime}
              onChange={handleTimeChange}
              style={{
                visibility: "hidden",
                position: "absolute",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Pickup Type */}
        <div className={`${style.detailCard} ${style.armadaCard}`}>
          <div className={style.cardHeaderTop}>
            <div className={style.headerTitleGroup}>
              <div className={`${style.iconBox} ${style.iconDarkGreen}`}>
                <FaMousePointer style={{ color: "#FFFFFF" }} />
              </div>
              <span className={style.headerTitle}>Tipe Pick Up</span>
            </div>

            <div
              className={style.actionLink}
              onClick={() => setShowPickupTypeDropdown(!showPickupTypeDropdown)}
            >
              {!showPickupTypeDropdown && (
                <span>{selectedPickupType?.name}</span>
              )}
              <MdArrowForwardIos
                style={{
                  transform: showPickupTypeDropdown
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "0.3s",
                }}
              />
            </div>
          </div>

          {showPickupTypeDropdown && (
            <div className={style.vehicleOptionsList}>
              {pickupOptions.map((option) => (
                <div
                  key={option.id}
                  className={`${style.vehicleOptionItem} ${
                    selectedPickupType?.id === option.id
                      ? style.activeOption
                      : ""
                  }`}
                  onClick={() => handleSelectPickupType(option)}
                >
                  <input
                    type="radio"
                    name="pickupType"
                    checked={selectedPickupType?.id === option.id}
                    onChange={() => handleSelectPickupType(option)}
                    className={style.vehicleRadio}
                  />
                  {/* Icon Placeholder kecil */}
                  <div className={style.vehicleImgPlaceholderSmall}>
                    {option.id === 1 ? "1️⃣" : "📅"}
                  </div>

                  <span className={style.vehicleName}>{option.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className={`${style.detailCard} ${style.imageUploadCard}`}>
          <div className={style.headerTitleGroup}>
            <div className={`${style.iconBox}`}>
              <FaCamera style={{ color: "#FFFFFF" }} />
            </div>
            <span className={style.headerTitle}>
              Foto Sampah{" "}
              <span className={style.optionalLabel}>(Opsional)</span>
            </span>
          </div>

          <div className={style.imageUploadContainer}>
            {!imagePreview ? (
              <>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className={style.imageUploadLabel}>
                  <FaCamera />
                  <span>Klik untuk upload atau ambil foto</span>
                </label>
                <span className={style.imageFormatText}>
                  Format: PNG, JPG, JPEG (Max 5MB)
                </span>
              </>
            ) : (
              <div className={style.imagePreviewContainer}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={style.imagePreview}
                />
                <button
                  onClick={handleRemoveImage}
                  className={style.removeImageButton}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className={`${style.detailCard} ${style.notesCard}`}>
          <div className={style.headerTitleGroup}>
            <div className={`${style.iconBox}`}>
              <FaStickyNote style={{ color: "#FFFFFF" }} />
            </div>
            <span className={style.headerTitle}>
              Catatan <span className={style.optionalLabel}>(Opsional)</span>
            </span>
          </div>

          <textarea
            className={style.notesTextarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Tambahkan catatan jika diperlukan..."
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            className={style.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menambahkan..." : "Tambahkan"}
          </button>
        </div>
      </div>

      <div className={`${style.rightSide} calendar-container`}>
        <Calendar refreshTrigger={refreshKey} />
      </div>

      {/* Confirmation Modal */}
      <PickupConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        data={{
          name: addressData.name,
          phone: addressData.phone,
          address: addressData.address,
          regency: pickupRegency,
          weight: weight,
          date: selectedDate,
          time: selectedTime,
          vehicleType: selectedVehicle?.name || "",
          pickupType: selectedPickupType?.name || "",
          notes: notes,
          imagePreview: imagePreview,
        }}
      />
    </div>
  );
}
