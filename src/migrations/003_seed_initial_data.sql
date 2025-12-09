-- NEW
-- =============================================
-- ROLES
-- =============================================
INSERT INTO ms_role (id, role_name) 
VALUES 
  (1, 'Administrator'), 
  (2, 'Customer'), 
  (3, 'Driver')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- =============================================
-- TRANSACTION STATUS
-- =============================================
INSERT INTO ms_transaction_status (id, transaction_status_name, description) 
VALUES
  (1, 'Pending', 'Transaction is pending'),
  (2, 'Accepted', 'Transaction has been accepted'),
  (3, 'Processing', 'Transaction is being processed'),
  (4, 'Completed', 'Transaction is completed'),
  (5, 'Cancelled', 'Transaction has been cancelled')
ON DUPLICATE KEY UPDATE 
  transaction_status_name = VALUES(transaction_status_name),
  description = VALUES(description);

-- =============================================
-- TIER LIST
-- =============================================
INSERT INTO ms_tier_list (id, tier_name, tier_icon, min_weight, max_weight, target_weight, description) 
VALUES
  (1, 'Sprout', NULL, 0.00, 10.00, 10.00, 'Pengguna baru atau jarang membuang sampah (0–10 kg/bulan). Mulai perjalanan ramah lingkunganmu!'),
  (2, 'Leafy Plant', NULL, 10.01, 30.00, 30.00, 'Pengguna aktif yang rutin menggunakan layanan (10–30 kg/bulan). Dapatkan bonus poin 5% dan prioritas penjemputan standar.'),
  (3, 'Fruity Tree', NULL, 30.01, NULL, 50.00, 'Pengguna paling aktif dengan kontribusi besar (>30 kg/bulan). Dapatkan bonus poin 10%, badge khusus, dan prioritas penjemputan cepat!')
ON DUPLICATE KEY UPDATE 
  tier_name = VALUES(tier_name),
  tier_icon = VALUES(tier_icon),
  min_weight = VALUES(min_weight),
  max_weight = VALUES(max_weight),
  target_weight = VALUES(target_weight),
  description = VALUES(description);

-- =============================================
-- ADMIN USER
-- =============================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO ms_user (role_id, provider, first_name, last_name, email, password)
VALUES (
  1,
  'local',
  'Administrator',
  'SILAP',
  'silap4everyone@gmail.com',
  '$2a$10$rZ8jHXqMJZQ9sZ5xGxHJ5u5vZ0jHXqMJZQ9sZ5xGxHJ5u5vZ0jHXq'
)
ON DUPLICATE KEY UPDATE 
  first_name = VALUES(first_name),
  last_name = VALUES(last_name);

-- =============================================
-- PICKUP TYPES
-- =============================================
INSERT INTO ms_pickup_type (id, pickup_type_name, description) 
VALUES 
  (1, 'One Time', 'Penjemputan satu kali sesuai jadwal yang dipilih'),
  (2, 'Weekly', 'Penjemputan terjadwal setiap minggu')
ON DUPLICATE KEY UPDATE 
  pickup_type_name = VALUES(pickup_type_name),
  description = VALUES(description);

-- =============================================
-- SUBSCRIPTION PLANS (Sample)
-- =============================================
INSERT INTO ms_subscription_plan (id, plan_name, description, price, duration_days, pickup_frequency, max_weight) 
VALUES
  (1, 'Individual', 'Paket berlangganan bulanan untuk individu/rumah tangga dengan penjemputan rutin setiap minggu', 75000.00, 30, 'Weekly', 30.00),
  (2, 'Business', 'Paket berlangganan bulanan untuk bisnis/corporate dengan penjemputan fleksibel', 250000.00, 30, 'Flexible', 150.00)
ON DUPLICATE KEY UPDATE 
  plan_name = VALUES(plan_name),
  description = VALUES(description),
  price = VALUES(price),
  duration_days = VALUES(duration_days),
  pickup_frequency = VALUES(pickup_frequency),
  max_weight = VALUES(max_weight);
