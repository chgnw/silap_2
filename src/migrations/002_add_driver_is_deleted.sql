-- Migration: Add is_deleted column to ms_driver for soft delete
ALTER TABLE ms_driver ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_driver_deleted ON ms_driver(is_deleted);
