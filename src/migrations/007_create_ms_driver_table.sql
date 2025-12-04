-- Create ms_driver table for driver-specific data
CREATE TABLE IF NOT EXISTS ms_driver (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  license_number VARCHAR(50) NULL COMMENT 'Nomor SIM',
  id_card_number VARCHAR(50) NULL COMMENT 'Nomor KTP',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Status verifikasi dokumen',
  is_available BOOLEAN DEFAULT TRUE COMMENT 'Status ketersediaan driver',
  total_deliveries INT UNSIGNED DEFAULT 0 COMMENT 'Total pengantaran',
  assigned_vehicle_id INT UNSIGNED NULL COMMENT 'Kendaraan yang sedang dipakai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES ms_users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_vehicle_id) REFERENCES ms_vehicle(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

