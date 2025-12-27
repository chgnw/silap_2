-- =============================================
-- SILAP DATABASE MIGRATION
-- Add cancel_reason column to tr_payment_history
-- =============================================

ALTER TABLE tr_payment_history 
ADD COLUMN cancel_reason TEXT NULL COMMENT 'Reason for cancellation if payment was cancelled';
