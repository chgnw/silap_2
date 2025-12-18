-- =============================================
-- ADD NEW TRANSACTION STATUSES FOR PICKUP FLOW
-- =============================================
-- Status ID 6: Driver sedang menuju lokasi pickup
-- Status ID 7: Driver sudah sampai dan sedang melakukan pickup

INSERT INTO ms_transaction_status (id, transaction_status_name, description) 
VALUES
  (6, 'Menuju Lokasi', 'Driver sedang dalam perjalanan menuju lokasi penjemputan'),
  (7, 'Sampai di Lokasi', 'Driver sudah sampai dan sedang melakukan pickup')
ON DUPLICATE KEY UPDATE 
  transaction_status_name = VALUES(transaction_status_name),
  description = VALUES(description);

ALTER TABLE ms_reward_category 
ADD COLUMN icon_path VARCHAR(512) NULL AFTER category_name;

-- Add is_active column to master tables for soft delete functionality
-- Reward Category
ALTER TABLE ms_reward_category 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_reward 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_waste_category 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_vehicle_category 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_vehicle 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_pickup_type 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE ms_subscription_plan 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- =============================================
-- FAQ TABLE
-- =============================================

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


