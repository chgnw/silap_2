-- NEW
-- =============================================
-- ROLE & USER MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS ms_role (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_tier_list (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL UNIQUE,
  tier_icon VARCHAR(512) NULL,
  min_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_weight DECIMAL(10,2) NULL,
  target_weight DECIMAL(10,2) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_user (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  tier_list_id INT UNSIGNED NULL,
  provider ENUM('local','google') NOT NULL DEFAULT 'local',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL COMMENT 'NULL for OAuth users',
  phone_number VARCHAR(50) NULL,
  
  -- Address details
  address TEXT NULL,
  village VARCHAR(255) NULL COMMENT 'Kelurahan/Desa',
  subdistrict VARCHAR(255) NULL COMMENT 'Kecamatan',
  regency VARCHAR(255) NULL COMMENT 'Kabupaten/Kota',
  province VARCHAR(255) NULL,
  postal_code VARCHAR(10) NULL,
  
  -- Gamification
  points INT UNSIGNED DEFAULT 0 COMMENT 'Current available points',
  current_streak INT UNSIGNED DEFAULT 0 COMMENT 'Current pickup streak',
  waste_target DECIMAL(10, 2) DEFAULT 0 COMMENT 'Monthly waste target in kg',
  
  profile_picture VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES ms_role(id),
  FOREIGN KEY (tier_list_id) REFERENCES ms_tier_list(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role (role_id),
  INDEX idx_tier (tier_list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DRIVER MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS ms_driver (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  id_card_number VARCHAR(20) NULL COMMENT 'KTP/NIK number',
  license_number VARCHAR(50) NULL COMMENT 'Driver license number',
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  total_deliveries INT UNSIGNED DEFAULT 0,
  assigned_vehicle_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_available (is_available),
  INDEX idx_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- VEHICLE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS ms_vehicle_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., Motor, Mobil Pickup, Truk',
  min_weight DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Minimum weight capacity in kg',
  max_weight DECIMAL(10,2) NOT NULL COMMENT 'Maximum weight capacity in kg',
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_vehicle (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_category_id INT UNSIGNED NOT NULL,
  brand VARCHAR(100) NULL COMMENT 'Vehicle brand/manufacturer',
  model VARCHAR(100) NULL COMMENT 'Vehicle model',
  license_plate VARCHAR(20) NOT NULL UNIQUE COMMENT 'License plate number',
  vin VARCHAR(50) NULL COMMENT 'Vehicle Identification Number',
  status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_category_id) REFERENCES ms_vehicle_category(id),
  INDEX idx_category (vehicle_category_id),
  INDEX idx_status (status),
  INDEX idx_license (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK for assigned_vehicle_id in ms_driver (after ms_vehicle exists)
ALTER TABLE ms_driver 
  ADD CONSTRAINT fk_driver_vehicle 
  FOREIGN KEY (assigned_vehicle_id) REFERENCES ms_vehicle(id) ON DELETE SET NULL;

-- =============================================
-- WASTE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS ms_waste_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waste_category_name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NULL COMMENT 'Icon identifier (e.g., FaRecycle)',
  unit VARCHAR(20) NOT NULL DEFAULT 'kg' COMMENT 'Unit of measurement (kg, liter, pcs, etc)',
  point_per_unit DECIMAL(10, 2) DEFAULT 0 COMMENT 'Points per unit',
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PICKUP TYPE
-- =============================================

CREATE TABLE IF NOT EXISTS ms_pickup_type (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pickup_type_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., One Time, Weekly Scheduled',
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- REWARD MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS ms_reward_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ms_reward (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  reward_name VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(100) NULL,
  image_path VARCHAR(512) NULL,
  point_required INT UNSIGNED NOT NULL,
  stock INT UNSIGNED DEFAULT 0,
  total_redeemed INT UNSIGNED DEFAULT 0,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES ms_reward_category(id),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_point (point_required)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TRANSACTION STATUS
-- =============================================

CREATE TABLE IF NOT EXISTS ms_transaction_status (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_status_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SUBSCRIPTION PLANS (for future subscription feature)
-- =============================================

CREATE TABLE IF NOT EXISTS ms_subscription_plan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INT UNSIGNED NOT NULL DEFAULT 30,
  pickup_frequency VARCHAR(50) NULL,
  max_weight DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
