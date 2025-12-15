INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_plan_id,
  payment_type, payment_method, payment_proof_url, total_payment,
  transaction_status_id, payment_time, created_at, updated_at
) VALUES (
  100,
  'PAY-15122025-00000100',
  6,
  1, 
  'Subscription',
  'bank_transfer',
  '/upload/payment-proof/payment-100.jpg',
  75000.00,
  1,
  '2025-12-15 10:30:00',
  '2025-12-15 10:30:00',
  '2025-12-15 10:30:00'
) ON DUPLICATE KEY UPDATE transaction_code = VALUES(transaction_code);

-- Pending Payment 2: Another user wants Business plan
INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_plan_id,
  payment_type, payment_method, payment_proof_url, total_payment,
  transaction_status_id, payment_time, created_at, updated_at
) VALUES (
  101,
  'PAY-14122025-00000101',
  6,
  2,
  'Subscription',
  'e-wallet',
  '/upload/payment-proof/payment-101.jpg',
  250000.00,
  1, -- Pending
  '2025-12-14 14:45:00',
  '2025-12-14 14:45:00',
  '2025-12-14 14:45:00'
) ON DUPLICATE KEY UPDATE transaction_code = VALUES(transaction_code);

-- Pending Payment 3: Older pending payment
INSERT INTO tr_payment_history (
  id, transaction_code, user_id, subscription_plan_id,
  payment_type, payment_method, payment_proof_url, total_payment,
  transaction_status_id, payment_time, created_at, updated_at
) VALUES (
  102,
  'PAY-13122025-00000102',
  6,
  1,
  'Subscription',
  'bank_transfer',
  NULL, -- No proof uploaded yet
  75000.00,
  1, -- Pending
  '2025-12-13 09:15:00',
  '2025-12-13 09:15:00',
  '2025-12-13 09:15:00'
) ON DUPLICATE KEY UPDATE transaction_code = VALUES(transaction_code);
