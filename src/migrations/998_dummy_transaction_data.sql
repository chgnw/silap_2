-- =============================================
-- REWARD CATEGORIES & REWARDS (Required for redemptions)
-- =============================================
INSERT INTO ms_reward_category (id, category_name, description) 
VALUES
  (1, 'Voucher', 'Voucher belanja dan diskon'),
  (2, 'Produk', 'Produk fisik yang dapat ditukar'),
  (3, 'Donasi', 'Donasi untuk kegiatan sosial')
ON DUPLICATE KEY UPDATE 
  category_name = VALUES(category_name),
  description = VALUES(description);

INSERT INTO ms_reward (id, category_id, reward_name, vendor_name, image_path, point_required, stock, total_redeemed, description, is_active) 
VALUES
  (1, 1, 'Voucher Alfamart Rp 10.000', 'Alfamart', '/images/rewards/alfamart-10k.png', 100, 50, 5, 'Voucher belanja Alfamart senilai Rp 10.000', TRUE),
  (2, 1, 'Voucher Indomaret Rp 25.000', 'Indomaret', '/images/rewards/indomaret-25k.png', 250, 30, 3, 'Voucher belanja Indomaret senilai Rp 25.000', TRUE),
  (3, 2, 'Tumbler Stainless', 'EcoLife', '/images/rewards/tumbler.png', 500, 20, 2, 'Tumbler stainless steel ramah lingkungan', TRUE),
  (4, 2, 'Tas Belanja Kanvas', 'GreenBag', '/images/rewards/tote-bag.png', 300, 40, 8, 'Tas belanja kanvas reusable', TRUE),
  (5, 3, 'Donasi Penanaman Pohon', 'Yayasan Hijau', '/images/rewards/tree-donation.png', 200, 100, 15, 'Donasi untuk penanaman 1 pohon', TRUE)
ON DUPLICATE KEY UPDATE 
  category_id = VALUES(category_id),
  reward_name = VALUES(reward_name),
  vendor_name = VALUES(vendor_name),
  point_required = VALUES(point_required),
  stock = VALUES(stock),
  description = VALUES(description);

-- =============================================
-- PICKUP EVENTS (Scheduled Pickups)
-- =============================================
-- Event 1: Pending pickup event (belum diterima driver)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  created_at, updated_at
) VALUES (
  1,
  'PCK-13122025-00000001',
  6,
  1, -- One Time
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  15.50,
  '2025-12-15',
  '09:00:00',
  1, -- Motor
  '/uploads/pickup-events/event-001.jpg',
  'Sampah sudah dipilah, ada 3 kantong besar',
  'pending',
  '2025-12-13 08:30:00',
  '2025-12-13 08:30:00'
);

-- Event 2: Accepted pickup event (sudah diterima driver, belum selesai)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  created_at, updated_at
) VALUES (
  2,
  'PCK-12122025-00000002',
  6,
  2, -- Weekly
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  25.00,
  '2025-12-14',
  '14:00:00',
  2, -- Mobil Pickup
  '/uploads/pickup-events/event-002.jpg',
  'Sampah mingguan, tolong bawa kantong besar',
  'accepted',
  '2025-12-12 10:00:00',
  '2025-12-13 07:00:00'
);

-- Event 3: Completed pickup event (sudah selesai, ada di tr_pickup)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  completed_at, created_at, updated_at
) VALUES (
  3,
  'PCK-10122025-00000003',
  6,
  1, -- One Time
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  18.75,
  '2025-12-11',
  '10:00:00',
  1, -- Motor
  '/uploads/pickup-events/event-003.jpg',
  'Sampah organik dan anorganik',
  'completed',
  '2025-12-11 10:45:00',
  '2025-12-10 15:00:00',
  '2025-12-11 10:45:00'
);

-- Event 4: Completed pickup event (sudah selesai)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  completed_at, created_at, updated_at
) VALUES (
  4,
  'PCK-05122025-00000004',
  6,
  1, -- One Time
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  32.50,
  '2025-12-06',
  '08:30:00',
  2, -- Mobil Pickup
  '/uploads/pickup-events/event-004.jpg',
  'Banyak sampah anorganik (plastik dan kertas)',
  'completed',
  '2025-12-06 09:15:00',
  '2025-12-05 14:30:00',
  '2025-12-06 09:15:00'
);

-- Event 5: Cancelled pickup event
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  created_at, updated_at
) VALUES (
  5,
  'PCK-08122025-00000005',
  6,
  1, -- One Time
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  10.00,
  '2025-12-09',
  '15:00:00',
  1, -- Motor
  NULL,
  'Dibatalkan karena ada keperluan mendadak',
  'cancelled',
  '2025-12-08 09:00:00',
  '2025-12-08 16:00:00'
);

-- Event 6: Completed pickup event (older data)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  completed_at, created_at, updated_at
) VALUES (
  6,
  'PCK-01122025-00000006',
  6,
  2, -- Weekly
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  22.00,
  '2025-12-02',
  '11:00:00',
  1, -- Motor
  '/uploads/pickup-events/event-006.jpg',
  'Penjemputan rutin mingguan',
  'completed',
  '2025-12-02 11:30:00',
  '2025-12-01 08:00:00',
  '2025-12-02 11:30:00'
);

-- =============================================
-- PICKUPS (Completed Pickup Transactions)
-- =============================================
-- Pickup 1: From Event 3 (Completed)
INSERT INTO tr_pickup (
  id, transaction_code, user_id, pickup_event_id, driver_id, 
  transaction_status_id, pickup_address, notes, 
  request_time, pickup_schedule, completion_time,
  created_at, updated_at
) VALUES (
  1,
  'PCK-10122025-00000003',
  6,
  3,
  4,
  4, -- Completed
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  'Sampah sudah ditimbang dan dipilah',
  '2025-12-11 09:00:00',
  '2025-12-11 10:00:00',
  '2025-12-11 10:45:00',
  '2025-12-11 09:00:00',
  '2025-12-11 10:45:00'
);

-- Pickup Items for Pickup 1
INSERT INTO tr_pickup_item (pickup_id, waste_category_id, weight, points_earned) VALUES
  (1, 1, 8.50, 51),   -- Organik: 8.5 kg × 6 pts = 51 pts
  (1, 2, 10.25, 82);  -- Anorganik: 10.25 kg × 8 pts = 82 pts
-- Total: 18.75 kg, 133 points

-- Pickup 2: From Event 4 (Completed)
INSERT INTO tr_pickup (
  id, transaction_code, user_id, pickup_event_id, driver_id, 
  transaction_status_id, pickup_address, notes, 
  request_time, pickup_schedule, completion_time,
  created_at, updated_at
) VALUES (
  2,
  'PCK-05122025-00000004',
  6,
  4,
  4,
  4, -- Completed
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  'Banyak plastik dan kertas, kondisi baik',
  '2025-12-06 07:30:00',
  '2025-12-06 08:30:00',
  '2025-12-06 09:15:00',
  '2025-12-06 07:30:00',
  '2025-12-06 09:15:00'
);

-- Pickup Items for Pickup 2
INSERT INTO tr_pickup_item (pickup_id, waste_category_id, weight, points_earned) VALUES
  (2, 2, 28.00, 224),  -- Anorganik: 28 kg × 8 pts = 224 pts
  (2, 3, 4.50, 45);    -- B3: 4.5 kg × 10 pts = 45 pts
-- Total: 32.5 kg, 269 points

-- Pickup 3: From Event 6 (Completed)
INSERT INTO tr_pickup (
  id, transaction_code, user_id, pickup_event_id, driver_id, 
  transaction_status_id, pickup_address, notes, 
  request_time, pickup_schedule, completion_time,
  created_at, updated_at
) VALUES (
  3,
  'PCK-01122025-00000006',
  6,
  6,
  4,
  4, -- Completed
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  'Penjemputan rutin, semua kategori ada',
  '2025-12-02 10:00:00',
  '2025-12-02 11:00:00',
  '2025-12-02 11:30:00',
  '2025-12-02 10:00:00',
  '2025-12-02 11:30:00'
);

-- Pickup Items for Pickup 3
INSERT INTO tr_pickup_item (pickup_id, waste_category_id, weight, points_earned) VALUES
  (3, 1, 12.00, 72),   -- Organik: 12 kg × 6 pts = 72 pts
  (3, 2, 8.00, 64),    -- Anorganik: 8 kg × 8 pts = 64 pts
  (3, 3, 2.00, 20);    -- B3: 2 kg × 10 pts = 20 pts
-- Total: 22 kg, 156 points

-- Pickup 4: Older completed pickup (November)
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  completed_at, created_at, updated_at
) VALUES (
  7,
  'PCK-25112025-00000007',
  6,
  1, -- One Time
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  15.00,
  '2025-11-26',
  '13:00:00',
  1, -- Motor
  '/uploads/pickup-events/event-007.jpg',
  'Sampah organik dari kebun',
  'completed',
  '2025-11-26 13:45:00',
  '2025-11-25 16:00:00',
  '2025-11-26 13:45:00'
);

INSERT INTO tr_pickup (
  id, transaction_code, user_id, pickup_event_id, driver_id, 
  transaction_status_id, pickup_address, notes, 
  request_time, pickup_schedule, completion_time,
  created_at, updated_at
) VALUES (
  4,
  'PCK-25112025-00000007',
  6,
  7,
  4,
  4, -- Completed
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  'Sampah organik dari kebun, kondisi kering',
  '2025-11-26 12:00:00',
  '2025-11-26 13:00:00',
  '2025-11-26 13:45:00',
  '2025-11-26 12:00:00',
  '2025-11-26 13:45:00'
);

INSERT INTO tr_pickup_item (pickup_id, waste_category_id, weight, points_earned) VALUES
  (4, 1, 15.00, 90);   -- Organik: 15 kg × 6 pts = 90 pts

-- =============================================
-- POINT HISTORY (From Pickups)
-- =============================================
-- Points earned from Pickup 1
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, 133, 1, NULL, 'Poin dari pickup PCK-10122025-00000003', '2025-12-11 10:45:00');

-- Points earned from Pickup 2
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, 269, 2, NULL, 'Poin dari pickup PCK-05122025-00000004', '2025-12-06 09:15:00');

-- Points earned from Pickup 3
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, 156, 3, NULL, 'Poin dari pickup PCK-01122025-00000006', '2025-12-02 11:30:00');

-- Points earned from Pickup 4
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, 90, 4, NULL, 'Poin dari pickup PCK-25112025-00000007', '2025-11-26 13:45:00');

-- =============================================
-- REDEMPTIONS (Reward Redemptions)
-- =============================================
-- Redemption 1: Completed - Voucher Alfamart
INSERT INTO tr_redemption (
  id, transaction_code, user_id, reward_id, 
  points_per_item, quantity, total_points_spent, 
  redemption_status, created_at, completed_at
) VALUES (
  1,
  'RDM-07122025-00000001',
  6,
  1, -- Voucher Alfamart Rp 10.000
  100,
  2,
  200,
  'completed',
  '2025-12-07 14:30:00',
  '2025-12-07 14:35:00'
);

-- Point history for Redemption 1
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, -200, NULL, 1, 'Penukaran 2x Voucher Alfamart Rp 10.000', '2025-12-07 14:30:00');

-- Redemption 2: Completed - Donasi Penanaman Pohon
INSERT INTO tr_redemption (
  id, transaction_code, user_id, reward_id, 
  points_per_item, quantity, total_points_spent, 
  redemption_status, created_at, completed_at
) VALUES (
  2,
  'RDM-03122025-00000002',
  6,
  5, -- Donasi Penanaman Pohon
  200,
  1,
  200,
  'completed',
  '2025-12-03 10:15:00',
  '2025-12-03 10:20:00'
);

-- Point history for Redemption 2
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, -200, NULL, 2, 'Donasi untuk penanaman 1 pohon', '2025-12-03 10:15:00');

-- Redemption 3: Pending - Tas Belanja Kanvas
INSERT INTO tr_redemption (
  id, transaction_code, user_id, reward_id, 
  points_per_item, quantity, total_points_spent, 
  redemption_status, created_at, completed_at
) VALUES (
  3,
  'RDM-12122025-00000003',
  6,
  4, -- Tas Belanja Kanvas
  300,
  1,
  300,
  'pending',
  '2025-12-12 16:45:00',
  NULL
);

-- Point history for Redemption 3
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, -300, NULL, 3, 'Penukaran Tas Belanja Kanvas (pending)', '2025-12-12 16:45:00');

-- Redemption 4: Cancelled - Tumbler Stainless
INSERT INTO tr_redemption (
  id, transaction_code, user_id, reward_id, 
  points_per_item, quantity, total_points_spent, 
  redemption_status, created_at, completed_at
) VALUES (
  4,
  'RDM-28112025-00000004',
  6,
  3, -- Tumbler Stainless
  500,
  1,
  500,
  'cancelled',
  '2025-11-28 11:00:00',
  NULL
);

-- Point history for Redemption 4 (refunded because cancelled)
INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, -500, NULL, 4, 'Penukaran Tumbler Stainless (dibatalkan)', '2025-11-28 11:00:00'),
  (6, 500, NULL, 4, 'Refund poin - penukaran dibatalkan', '2025-11-28 15:00:00');

-- =============================================
-- SUBSCRIPTIONS (User Subscriptions)
-- =============================================
-- Subscription 1: Active subscription (Individual Plan)
INSERT INTO tr_user_subscription (
  id, user_id, subscription_plan_id, 
  start_date, end_date, status, auto_renew,
  created_at, updated_at
) VALUES (
  1,
  6,
  1, -- Individual Plan
  '2025-12-01',
  '2025-12-31',
  'active',
  TRUE,
  '2025-11-30 10:00:00',
  '2025-11-30 10:00:00'
);

-- Payment for Subscription 1
INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_id, 
  payment_type, payment_method, total_payment, 
  transaction_status_id, payment_time,
  created_at, updated_at
) VALUES (
  1,
  'PAY-30112025-00000001',
  6,
  1,
  'Subscription',
  'e-wallet',
  75000.00,
  4, -- Completed
  '2025-11-30 10:05:00',
  '2025-11-30 10:05:00',
  '2025-11-30 10:05:00'
);

-- Subscription 2: Expired subscription (Previous month)
INSERT INTO tr_user_subscription (
  id, user_id, subscription_plan_id, 
  start_date, end_date, status, auto_renew,
  created_at, updated_at
) VALUES (
  2,
  6,
  1, -- Individual Plan
  '2025-11-01',
  '2025-11-30',
  'expired',
  FALSE,
  '2025-10-31 09:00:00',
  '2025-12-01 00:00:01'
);

-- Payment for Subscription 2
INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_id, 
  payment_type, payment_method, total_payment, 
  transaction_status_id, payment_time,
  created_at, updated_at
) VALUES (
  2,
  'PAY-31102025-00000002',
  6,
  2,
  'Subscription',
  'bank_transfer',
  75000.00,
  4, -- Completed
  '2025-10-31 09:15:00',
  '2025-10-31 09:15:00',
  '2025-10-31 09:15:00'
);

-- Subscription 3: Cancelled subscription
INSERT INTO tr_user_subscription (
  id, user_id, subscription_plan_id, 
  start_date, end_date, status, auto_renew,
  created_at, updated_at
) VALUES (
  3,
  6,
  2, -- Business Plan
  '2025-10-01',
  '2025-10-31',
  'cancelled',
  FALSE,
  '2025-09-30 14:00:00',
  '2025-10-15 16:30:00'
);

-- Payment for Subscription 3 (was completed before cancellation)
INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_id, 
  payment_type, payment_method, total_payment, 
  transaction_status_id, payment_time,
  created_at, updated_at
) VALUES (
  3,
  'PAY-30092025-00000003',
  6,
  3,
  'Subscription',
  'credit_card',
  250000.00,
  4, -- Completed
  '2025-09-30 14:10:00',
  '2025-09-30 14:10:00',
  '2025-09-30 14:10:00'
);

-- =============================================
-- UPDATE USER POINTS
-- =============================================
-- Calculate total points for user 6:
-- Earned: 133 + 269 + 156 + 90 = 648 points
-- Spent: 200 + 200 + 300 = 700 points (Redemption 4 was refunded)
-- Current points: 648 - 700 = -52 (should be adjusted)
-- Let's add more pickup history to make it positive

-- Additional older pickups to increase points
INSERT INTO tr_pickup_event (
  id, transaction_code, user_id, pickup_type_id, 
  pickup_address, pickup_weight, event_date, pickup_time, 
  vehicle_category_id, image_url, user_notes, event_status, 
  completed_at, created_at, updated_at
) VALUES (
  8,
  'PCK-15112025-00000008',
  6,
  2, -- Weekly
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  28.00,
  '2025-11-16',
  '10:00:00',
  2, -- Mobil Pickup
  '/uploads/pickup-events/event-008.jpg',
  'Penjemputan mingguan',
  'completed',
  '2025-11-16 10:45:00',
  '2025-11-15 08:00:00',
  '2025-11-16 10:45:00'
);

INSERT INTO tr_pickup (
  id, transaction_code, user_id, pickup_event_id, driver_id, 
  transaction_status_id, pickup_address, notes, 
  request_time, pickup_schedule, completion_time,
  created_at, updated_at
) VALUES (
  5,
  'PCK-15112025-00000008',
  6,
  8,
  4,
  4, -- Completed
  'Jl. Merdeka No. 123, Kelurahan Suka Maju, Kecamatan Medan Baru, Kota Medan, Sumatera Utara 20154',
  'Mix sampah semua kategori',
  '2025-11-16 09:00:00',
  '2025-11-16 10:00:00',
  '2025-11-16 10:45:00',
  '2025-11-16 09:00:00',
  '2025-11-16 10:45:00'
);

INSERT INTO tr_pickup_item (pickup_id, waste_category_id, weight, points_earned) VALUES
  (5, 1, 10.00, 60),   -- Organik: 10 kg × 6 pts = 60 pts
  (5, 2, 15.00, 120),  -- Anorganik: 15 kg × 8 pts = 120 pts
  (5, 3, 3.00, 30);    -- B3: 3 kg × 10 pts = 30 pts
-- Total: 28 kg, 210 points

INSERT INTO tr_point_history (user_id, points_change, pickup_id, redemption_id, description, created_at) VALUES
  (6, 210, 5, NULL, 'Poin dari pickup PCK-15112025-00000008', '2025-11-16 10:45:00');

-- Update user points and streak
-- Total earned: 648 + 210 = 858 points
-- Total spent: 700 points
-- Current available: 158 points
UPDATE ms_user 
SET 
  points = 158,
  current_streak = 5,
  waste_target = 50.00
WHERE id = 6;

-- =============================================
-- SUMMARY
-- =============================================
-- User ID 6 Transaction Summary:
-- 
-- PICKUP EVENTS:
-- - 8 total events (3 completed with pickups, 1 pending, 1 accepted, 1 cancelled)
--
-- PICKUPS:
-- - 5 completed pickups
-- - Total waste collected: 115.75 kg
--   * Organik: 45.5 kg (273 points)
--   * Anorganik: 61.25 kg (490 points)
--   * B3: 9.5 kg (95 points)
-- - Total points earned: 858 points
--
-- REDEMPTIONS:
-- - 4 redemptions (2 completed, 1 pending, 1 cancelled)
-- - Total points spent: 700 points (excluding refunded)
--
-- SUBSCRIPTIONS:
-- - 3 subscriptions (1 active, 1 expired, 1 cancelled)
-- - Total payments: Rp 400,000
--
-- CURRENT STATUS:
-- - Available points: 158 points
-- - Current streak: 5
-- - Waste target: 50 kg/month
