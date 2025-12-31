-- =============================================
-- SILAP DATABASE MIGRATION
-- Add cancel_reason column to tr_payment_history
-- =============================================

ALTER TABLE tr_payment_history 
ADD COLUMN cancel_reason TEXT NULL COMMENT 'Reason for cancellation if payment was cancelled';

-- Fix max_weight constraint in ms_vehicle_category
-- Allow NULL for unlimited capacity

ALTER TABLE ms_vehicle_category 
MODIFY COLUMN max_weight DECIMAL(10,2) NULL COMMENT 'Maximum weight capacity in kg (NULL = unlimited)';

