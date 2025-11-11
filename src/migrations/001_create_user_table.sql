-- =============================================
-- MASTER TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS ms_role (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_partner_type (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_type_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_waste_category (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waste_category_name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_waste_item (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waste_category_id INT UNSIGNED NOT NULL,
  waste_item_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  unit VARCHAR(20) NOT NULL,
  points_per_unit DECIMAL(10, 2) DEFAULT 0,
  image_url VARCHAR(512) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_transaction_status (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_status_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_donation_item_type (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_item_type_name VARCHAR(50) NOT NULL UNIQUE 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_tier_list (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL UNIQUE,
  min_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_weight DECIMAL(10,2) NULL,
  description TEXT NULL,
  benefit TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- =============================================
-- USER & PARTNER TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS ms_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  provider ENUM('local','google') NOT NULL DEFAULT 'local',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  phone_number VARCHAR(50) NULL,
  address TEXT NULL,
  points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  tier_list_id INT UNSIGNED NULL,
  waste_target DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_partners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL DEFAULT 2,
  partner_type_id INT UNSIGNED NOT NULL,
  partner_name VARCHAR(255) NOT NULL,
  address TEXT NULL,
  contact_person VARCHAR(255) NULL,
  contact_email VARCHAR(255) NULL UNIQUE,
  contact_phone VARCHAR(50) NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ms_partner_accepted_waste (
  partners_id INT UNSIGNED NOT NULL,
  waste_item_id INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- TRANSACTION TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS tr_pickups (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  users_id INT UNSIGNED NOT NULL,
  partners_id INT UNSIGNED NULL,
  transaction_status_id INT UNSIGNED NOT NULL,
  pickup_address TEXT NOT NULL,
  notes TEXT NULL,
  request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pickup_schedule TIMESTAMP NULL,
  completion_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tr_pickup_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pickups_id INT UNSIGNED NOT NULL,
  waste_item_id INT UNSIGNED NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  points_earned INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tr_donations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  users_id INT UNSIGNED NOT NULL,
  partners_id INT UNSIGNED NULL,
  donation_item_type_id INT UNSIGNED NOT NULL,
  transaction_status_id INT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  quantity VARCHAR(100) NULL,
  pickup_address TEXT NULL,
  notes TEXT NULL,
  request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pickup_schedule TIMESTAMP NULL,
  completion_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tr_point_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  users_id INT UNSIGNED NOT NULL,
  points_change INT NOT NULL,
  pickups_id INT UNSIGNED NULL,
  donations_id INT UNSIGNED NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- SEEDING DATA
-- =============================================

INSERT INTO ms_role (id, role_name) 
VALUES 
(1, 'customer'), 
(2, 'mitra'), 
(3, 'admin')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- Seeding Administrator
INSERT INTO ms_users (role_id, provider, first_name, email, password)
VALUES (
    (SELECT id FROM ms_role WHERE role_name = 'admin'),
    'local',
    'Administrator',
    'silap4everyone@gmail.com',
    '$2a$12$zaqSM/bluCXfdFRQhmAp1uS12ivJBLWyxzwhCEGjYwKuJBTftNUly'
)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

INSERT INTO ms_partner_type (id, partner_type_name) 
VALUES 
(1, 'BankSampah'), 
(2, 'Donasi'), 
(3, 'Kompos'), 
(4, 'UMKM')
ON DUPLICATE KEY UPDATE partner_type_name=VALUES(partner_type_name);

INSERT INTO ms_transaction_status (id, transaction_status_name) 
VALUES
(1, 'Pending'), 
(2, 'Assigned'), 
(3, 'Processing'), 
(4, 'Completed'), 
(5, 'Cancelled')
ON DUPLICATE KEY UPDATE transaction_status_name=VALUES(transaction_status_name);

INSERT INTO ms_donation_item_type (id, donation_item_type_name) 
VALUES
(1, 'Makanan'), 
(2, 'Pakaian'),
(3, 'Buku'), 
(4, 'Barang Lainnya')
ON DUPLICATE KEY UPDATE donation_item_type_name=VALUES(donation_item_type_name);

INSERT INTO ms_waste_category (id, waste_category_name, icon_name) 
VALUES
(1, 'Kertas', 'FaRegNewspaper'), 
(2, 'Plastik', 'GiWaterBottle'), 
(3, 'Elektronik', 'FaDesktop'),
(4, 'Besi & Logam', 'FaDrumSteelpan'), 
(5, 'Botol Kaca', 'FaDrumSteelpan'), 
(6, 'Khusus', 'FaBiohazard'),
(7, 'Makanan', 'MdFastfood'), 
(8, 'Kain', 'FaTshirt')
ON DUPLICATE KEY UPDATE waste_category_name=VALUES(waste_category_name), icon_name=VALUES(icon_name);

-- Seeding Waste Items
INSERT INTO ms_waste_item (waste_category_id, waste_item_name, unit, image_url) 
VALUES
(1, 'Kertas 1', 'kg', '/images/dummy.png'), 
(1, 'Kertas 2', 'kg', '/images/dummy.png'), 
(1, 'Kertas 3', 'kg', '/images/dummy.png'), 
(1, 'Kertas 4', 'kg', '/images/dummy.png'),

(2, 'Plastik 1', 'kg', '/images/dummy.png'), 
(2, 'Plastik 2', 'kg', '/images/dummy.png'), 
(2, 'Plastik 3', 'kg', '/images/dummy.png'), 
(2, 'Plastik 4', 'kg', '/images/dummy.png'),

(3, 'Elektronik 1', 'pcs', '/images/dummy.png'), 
(3, 'Elektronik 2', 'pcs', '/images/dummy.png'), 
(3, 'Elektronik 3', 'pcs', '/images/dummy.png'),

(4, 'Besi & Logam 1', 'kg', '/images/dummy.png'), 
(4, 'Besi & Logam 2', 'kg', '/images/dummy.png'), 
(4, 'Besi & Logam 3', 'kg', '/images/dummy.png'),

(5, 'Botol Kaca 1', 'pcs', '/images/dummy.png'), 
(5, 'Botol Kaca 2', 'pcs', '/images/dummy.png'), 
(5, 'Botol Kaca 3', 'pcs', '/images/dummy.png'), 
(5, 'Botol Kaca 4', 'pcs', '/images/dummy.png'),

(6, 'Khusus 1', 'kg', '/images/dummy.png'), 
(6, 'Khusus 2', 'kg', '/images/dummy.png'), 
(6, 'Khusus 3', 'kg', '/images/dummy.png'), 
(6, 'Khusus 4', 'kg', '/images/dummy.png'), 
(6, 'Khusus 5', 'kg', '/images/dummy.png'),

(7, 'Makanan 1', 'kg', '/images/dummy.png'), 
(7, 'Makanan 2', 'kg', '/images/dummy.png'), 
(7, 'Makanan 3', 'kg', '/images/dummy.png'),

(8, 'Kain 1', 'kg', '/images/dummy.png'), 
(8, 'Kain 2', 'kg', '/images/dummy.png')
ON DUPLICATE KEY UPDATE waste_item_name=VALUES(waste_item_name);

INSERT INTO ms_tier_list (tier_name, min_weight, max_weight, description, benefit)
VALUES
('Eco Starter', 0.00, 10.00, 'Pengguna baru atau jarang membuang sampah (0–10 kg/bulan).', 'Edukasi dan reminder ramah lingkungan.'),
('Eco Regular', 10.01, 30.00, 'Pengguna aktif yang rutin menggunakan layanan (10–30 kg/bulan).', 'Bonus poin 5%, prioritas penjemputan standar.'),
('Eco Hero', 30.01, NULL, 'Pengguna paling aktif dengan kontribusi besar (>30 kg/bulan).', 'Bonus poin 10%, badge khusus, prioritas cepat.');