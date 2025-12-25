-- =============================================
-- SILAP DATABASE SCHEMA
-- Complete optimized schema with all tables, indexes, and constraints
-- =============================================

-- =============================================
-- SECTION 1: MASTER TABLES (ms_*)
-- =============================================

-- ROLE & USER MANAGEMENT
-- ---------------------------------------------
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
  last_streak_week INT NULL COMMENT 'ISO week number of last streak update (format: YYYYWW)',
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

-- VEHICLE MANAGEMENT
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_vehicle_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., Motor, Mobil Pickup, Truk',
  min_weight DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Minimum weight capacity in kg',
  max_weight DECIMAL(10,2) NOT NULL COMMENT 'Maximum weight capacity in kg',
  image_path VARCHAR(512) NULL COMMENT 'Path to vehicle category image',
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
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
  status ENUM('available', 'in-use', 'maintenance', 'unavailable') DEFAULT 'available',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_category_id) REFERENCES ms_vehicle_category(id),
  INDEX idx_category (vehicle_category_id),
  INDEX idx_status (status),
  INDEX idx_license (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DRIVER MANAGEMENT
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_driver (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  id_card_number VARCHAR(20) NULL COMMENT 'KTP/NIK number',
  license_number VARCHAR(50) NULL COMMENT 'Driver license number',
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  total_deliveries INT UNSIGNED DEFAULT 0,
  assigned_vehicle_id INT UNSIGNED NULL,
  operational_area VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_vehicle_id) REFERENCES ms_vehicle(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_available (is_available),
  INDEX idx_verified (is_verified),
  INDEX idx_driver_operational_area (operational_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WASTE MANAGEMENT
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_waste_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waste_category_name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NULL COMMENT 'Icon identifier (e.g., FaRecycle)',
  unit VARCHAR(20) NOT NULL DEFAULT 'kg' COMMENT 'Unit of measurement (kg, liter, pcs, etc)',
  point_per_unit DECIMAL(10, 2) DEFAULT 0 COMMENT 'Points per unit',
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PICKUP TYPE
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_pickup_type (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pickup_type_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., One Time, Weekly Scheduled',
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REWARD MANAGEMENT
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_reward_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE,
  icon_path VARCHAR(512) NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
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

-- TRANSACTION STATUS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_transaction_status (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_status_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUBSCRIPTION PLANS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_subscription_plan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INT UNSIGNED NOT NULL DEFAULT 30,
  pickup_frequency VARCHAR(50) NULL,
  max_weight DECIMAL(10,2) NULL,
  features TEXT NULL COMMENT 'Comma-separated list of features',
  is_popular BOOLEAN DEFAULT FALSE COMMENT 'Mark as popular plan for badge display',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQ
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS ms_faq (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL COMMENT 'FAQ question',
  answer TEXT NOT NULL COMMENT 'FAQ answer',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether FAQ is visible',
  sort_order INT UNSIGNED DEFAULT 0 COMMENT 'Display order (lower = higher priority)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SECTION 2: TRANSACTION TABLES (tr_*)
-- =============================================

-- PICKUP TRANSACTIONS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS tr_pickup_event (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Format: PCK-DDMMYYYY-XXXXXXXX',
  user_id INT UNSIGNED NOT NULL,
  pickup_type_id INT UNSIGNED NOT NULL,
  
  -- Pickup details
  pickup_address TEXT NOT NULL,
  pickup_regency VARCHAR(255) NULL,
  pickup_weight DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Estimated weight in kg',
  event_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  
  -- Vehicle requirement
  vehicle_category_id INT UNSIGNED NOT NULL,
  
  -- Additional info
  image_url VARCHAR(512) NULL,
  user_notes TEXT NULL,
  event_status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_type_id) REFERENCES ms_pickup_type(id),
  FOREIGN KEY (vehicle_category_id) REFERENCES ms_vehicle_category(id),
  INDEX idx_user (user_id),
  INDEX idx_date (event_date),
  INDEX idx_status (event_status),
  INDEX idx_vehicle_category (vehicle_category_id),
  INDEX idx_transaction_code (transaction_code),
  INDEX idx_pickup_event_regency (pickup_regency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tr_pickup (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_code VARCHAR(50) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  pickup_event_id INT UNSIGNED NOT NULL,
  driver_id INT UNSIGNED NOT NULL,
  transaction_status_id INT UNSIGNED NOT NULL,
  
  pickup_address TEXT NOT NULL,
  notes TEXT NULL,
  
  request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When driver accepted',
  pickup_schedule TIMESTAMP NULL COMMENT 'Scheduled pickup time',
  completion_time TIMESTAMP NULL COMMENT 'When pickup was completed',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_event_id) REFERENCES tr_pickup_event(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES ms_driver(id),
  FOREIGN KEY (transaction_status_id) REFERENCES ms_transaction_status(id),
  INDEX idx_user (user_id),
  INDEX idx_event (pickup_event_id),
  INDEX idx_driver (driver_id),
  INDEX idx_status (transaction_status_id),
  INDEX idx_transaction_code (transaction_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tr_pickup_item (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pickup_id INT UNSIGNED NOT NULL,
  waste_category_id INT UNSIGNED NOT NULL,
  weight DECIMAL(10, 2) NOT NULL COMMENT 'Actual weight inputed by driver in kg',
  points_earned INT UNSIGNED DEFAULT 0 COMMENT 'Points earned for this category',
  
  FOREIGN KEY (pickup_id) REFERENCES tr_pickup(id) ON DELETE CASCADE,
  FOREIGN KEY (waste_category_id) REFERENCES ms_waste_category(id),
  INDEX idx_pickup (pickup_id),
  INDEX idx_category (waste_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REWARD REDEMPTIONS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS tr_redemption (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_code VARCHAR(50) NOT NULL COMMENT 'Format: RDM-DDMMYYYY-XXXXXXXX',
  user_id INT UNSIGNED NOT NULL,
  reward_id INT UNSIGNED NOT NULL,
  
  points_per_item INT UNSIGNED NOT NULL COMMENT 'Points per item at time of redemption',
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  total_points_spent INT UNSIGNED NOT NULL,
  
  redemption_status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES ms_reward(id),
  INDEX idx_user (user_id),
  INDEX idx_reward (reward_id),
  INDEX idx_transaction_code (transaction_code),
  INDEX idx_status (redemption_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- POINT HISTORY
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS tr_point_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  points_change INT NOT NULL COMMENT 'Positive for earning, negative for spending',
  pickup_id INT UNSIGNED NULL COMMENT 'Reference to pickup if points earned from pickup',
  redemption_id INT UNSIGNED NULL COMMENT 'Reference to redemption if points spent',
  description VARCHAR(255) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_id) REFERENCES tr_pickup(id) ON DELETE SET NULL,
  FOREIGN KEY (redemption_id) REFERENCES tr_redemption(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_pickup (pickup_id),
  INDEX idx_redemption (redemption_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUBSCRIPTION & PAYMENTS
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS tr_user_subscription (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  subscription_plan_id INT UNSIGNED NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_plan_id) REFERENCES ms_subscription_plan(id),
  INDEX idx_user (user_id),
  INDEX idx_plan (subscription_plan_id),
  INDEX idx_status (status),
  INDEX idx_date (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tr_payment_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Format: PAY-DDMMYYYY-XXXXXXXX',
  user_id INT UNSIGNED NOT NULL,
  subscription_plan_id INT UNSIGNED NULL COMMENT 'Reference to subscription plan',
  
  payment_type VARCHAR(50) NOT NULL DEFAULT 'Subscription' COMMENT 'Payment type',
  payment_method VARCHAR(50) NULL COMMENT 'e.g., credit_card, bank_transfer, e-wallet',
  payment_proof_url VARCHAR(512) NULL,
  reference_number VARCHAR(100) NULL,
  
  total_payment DECIMAL(10, 2) NOT NULL COMMENT 'Amount in IDR',
  transaction_status_id INT UNSIGNED NOT NULL,
  
  verified_by INT UNSIGNED NULL,
  verified_at TIMESTAMP NULL,
  payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_plan_id) REFERENCES ms_subscription_plan(id) ON DELETE SET NULL,
  FOREIGN KEY (transaction_status_id) REFERENCES ms_transaction_status(id),
  FOREIGN KEY (verified_by) REFERENCES ms_user(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_subscription_plan (subscription_plan_id),
  INDEX idx_status (transaction_status_id),
  INDEX idx_transaction_code (transaction_code),
  INDEX idx_payment_time (payment_time),
  INDEX idx_pending_payments (transaction_status_id, subscription_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SECTION 3: COMPOSITE INDEXES FOR COMMON QUERIES
-- =============================================

-- For dashboard queries: get user's active pickup events
CREATE INDEX idx_pickup_event_user_status_date 
  ON tr_pickup_event(user_id, event_status, event_date);

-- For driver queries: find available pickup events by vehicle category and date
CREATE INDEX idx_pickup_event_category_date_status 
  ON tr_pickup_event(vehicle_category_id, event_date, event_status);

-- For order history queries: get user's transactions
CREATE INDEX idx_pickup_user_created 
  ON tr_pickup(user_id, created_at DESC);

CREATE INDEX idx_redemption_user_created 
  ON tr_redemption(user_id, created_at DESC);

CREATE INDEX idx_payment_user_created 
  ON tr_payment_history(user_id, created_at DESC);

-- For point calculation: get pickup items by pickup
CREATE INDEX idx_pickup_item_pickup_point 
  ON tr_pickup_item(pickup_id, points_earned);

-- For reward filtering: active rewards by category and points
CREATE INDEX idx_reward_category_active_point 
  ON ms_reward(category_id, is_active, point_required);

-- For driver availability: find available drivers
CREATE INDEX idx_driver_available_verified 
  ON ms_driver(is_available, is_verified);

-- =============================================
-- SECTION 4: FULL-TEXT SEARCH INDEXES
-- =============================================

-- For searching rewards by name
ALTER TABLE ms_reward 
  ADD FULLTEXT INDEX ft_reward_name (reward_name, description);

-- =============================================
-- SECTION 5: PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Analyze tables for query optimization
ANALYZE TABLE ms_user;
ANALYZE TABLE ms_driver;
ANALYZE TABLE ms_vehicle;
ANALYZE TABLE ms_vehicle_category;
ANALYZE TABLE ms_waste_category;
ANALYZE TABLE ms_reward;
ANALYZE TABLE tr_pickup_event;
ANALYZE TABLE tr_pickup;
ANALYZE TABLE tr_pickup_item;
ANALYZE TABLE tr_redemption;
ANALYZE TABLE tr_point_history;

-- Optimize tables
OPTIMIZE TABLE ms_user;
OPTIMIZE TABLE tr_pickup_event;
OPTIMIZE TABLE tr_pickup;
OPTIMIZE TABLE tr_redemption;
