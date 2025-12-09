-- NEW
-- =============================================
-- PICKUP TRANSACTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS tr_pickup_event (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Format: PCK-DDMMYYYY-XXXXXXXX',
  user_id INT UNSIGNED NOT NULL,
  pickup_type_id INT UNSIGNED NOT NULL,
  
  -- Pickup details
  pickup_address TEXT NOT NULL,
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
  INDEX idx_transaction_code (transaction_code)
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

-- =============================================
-- POINT HISTORY
-- =============================================

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
  INDEX idx_user (user_id),
  INDEX idx_pickup (pickup_id),
  INDEX idx_redemption (redemption_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- REWARD REDEMPTIONS
-- =============================================

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

-- Add FK for redemption_id in tr_point_history (after tr_redemption exists)
ALTER TABLE tr_point_history 
  ADD CONSTRAINT fk_point_history_redemption 
  FOREIGN KEY (redemption_id) REFERENCES tr_redemption(id) ON DELETE SET NULL;

-- =============================================
-- SUBSCRIPTION & PAYMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS tr_user_subscription (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  subscription_plan_id INT UNSIGNED NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  
  auto_renew BOOLEAN DEFAULT FALSE,
  
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
  subscription_id INT UNSIGNED NULL COMMENT 'Reference to subscription if payment is for subscription',
  
  payment_type VARCHAR(50) NOT NULL DEFAULT 'Subscription' COMMENT 'Payment type',
  payment_method VARCHAR(50) NULL COMMENT 'e.g., credit_card, bank_transfer, e-wallet',
  
  total_payment DECIMAL(10, 2) NOT NULL COMMENT 'Amount in IDR',
  transaction_status_id INT UNSIGNED NOT NULL,
  
  payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_user(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES tr_user_subscription(id) ON DELETE SET NULL,
  FOREIGN KEY (transaction_status_id) REFERENCES ms_transaction_status(id),
  INDEX idx_user (user_id),
  INDEX idx_subscription (subscription_id),
  INDEX idx_status (transaction_status_id),
  INDEX idx_transaction_code (transaction_code),
  INDEX idx_payment_time (payment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
