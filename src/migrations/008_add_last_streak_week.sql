-- =============================================
-- ADD LAST STREAK WEEK COLUMN FOR WEEKLY STREAK TRACKING
-- =============================================

-- Add column to track when streak was last updated (ISO week format: YYYYWW)
ALTER TABLE ms_user 
ADD COLUMN last_streak_week INT NULL COMMENT 'ISO week number of last streak update (format: YYYYWW)';

-- Example: 202451 means Week 51 of 2024
-- Logic: 
-- - When user completes pickup, check current week (YYYYWW)
-- - If last_streak_week != current week: increment streak, update last_streak_week
-- - If last_streak_week == current week: don't increment (already counted this week)
-- - If current_week > last_streak_week + 1: streak was broken, reset to 1

-- =============================================
-- ADD IMAGE PATH COLUMN TO VEHICLE CATEGORY
-- =============================================

ALTER TABLE ms_vehicle_category 
ADD COLUMN image_path VARCHAR(512) NULL COMMENT 'Path to vehicle category image';

-- =============================================
-- ADD FEATURES AND IS_POPULAR TO SUBSCRIPTION PLAN
-- =============================================

ALTER TABLE ms_subscription_plan 
ADD COLUMN features TEXT NULL COMMENT 'Comma-separated list of features';

ALTER TABLE ms_subscription_plan 
ADD COLUMN is_popular BOOLEAN DEFAULT FALSE COMMENT 'Mark as popular plan for badge display';

