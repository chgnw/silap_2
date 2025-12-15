ALTER TABLE tr_payment_history 
  ADD COLUMN subscription_plan_id INT UNSIGNED NULL AFTER subscription_id,
  ADD COLUMN payment_proof_url VARCHAR(512) NULL AFTER payment_method,
  ADD COLUMN reference_number VARCHAR(100) NULL,
  ADD COLUMN verified_by INT UNSIGNED NULL,
  ADD COLUMN verified_at TIMESTAMP NULL;

ALTER TABLE tr_payment_history 
DROP COLUMN subscription_plan_id;

ALTER TABLE tr_payment_history
CHANGE COLUMN subscription_id subscription_plan_id INT UNSIGNED NULL;

ALTER TABLE tr_payment_history
  ADD CONSTRAINT fk_payment_subscription_plan 
  FOREIGN KEY (subscription_plan_id) REFERENCES ms_subscription_plan(id) ON DELETE SET NULL;

ALTER TABLE tr_payment_history
  ADD CONSTRAINT fk_payment_verified_by 
  FOREIGN KEY (verified_by) REFERENCES ms_user(id) ON DELETE SET NULL;

ALTER TABLE tr_user_subscription DROP COLUMN auto_renew;

ALTER TABLE tr_payment_history ADD INDEX idx_pending_payments (transaction_status_id, subscription_plan_id);

ALTER TABLE ms_vehicle
DROP COLUMN status;

ALTER TABLE ms_vehicle 
ADD COLUMN status ENUM('available', 'in-use', 'maintenance', 'unavailable') DEFAULT 'available' AFTER vin;