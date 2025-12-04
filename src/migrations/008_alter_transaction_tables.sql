ALTER TABLE tr_pickup_event
  ADD COLUMN user_notes TEXT NULL AFTER pickup_address,
  ADD COLUMN image_url VARCHAR(512) NULL AFTER user_notes;

ALTER TABLE tr_pickups
  CHANGE COLUMN users_id user_id INT UNSIGNED NOT NULL,
  CHANGE COLUMN partners_id partner_id INT UNSIGNED NULL,
  ADD COLUMN transaction_code VARCHAR(50) NOT NULL AFTER id,
  ADD COLUMN pickup_event_id INT UNSIGNED NULL AFTER user_id;

ALTER TABLE tr_pickup_items
  CHANGE COLUMN pickups_id pickup_id INT UNSIGNED NOT NULL;

ALTER TABLE tr_point_history
  CHANGE COLUMN users_id user_id INT UNSIGNED NOT NULL,
  CHANGE COLUMN pickups_id pickup_id INT UNSIGNED NULL,
  CHANGE COLUMN donations_id donation_id INT UNSIGNED NULL;

ALTER TABLE tr_payment_history
  ADD COLUMN transaction_code VARCHAR(50) NULL AFTER id;


