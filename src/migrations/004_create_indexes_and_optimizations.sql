-- NEW
-- =============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =============================================

-- For dashboard queries: get user's active pickup events
CREATE INDEX idx_pickup_event_user_status_date 
  ON tr_pickup_event(user_id, event_status, event_date);

-- For driver queries: find available pickup events by vehicle category and date
CREATE INDEX idx_pickup_event_category_date_status 
  ON tr_pickup_event(vehicle_category_id, event_date, event_status);

-- For order history queries: get user's transactions
CREATE INDEX idx_pickup_user_created 
  ON tr_pickup(user_id, created_at DESC);

CREATE INDEX idx_redemption_user_created 
  ON tr_redemption(user_id, created_at DESC);

CREATE INDEX idx_payment_user_created 
  ON tr_payment_history(user_id, created_at DESC);

-- For point calculation: get pickup items by pickup
CREATE INDEX idx_pickup_item_pickup_point 
  ON tr_pickup_item(pickup_id, point_earned);

-- For reward filtering: active rewards by category and points
CREATE INDEX idx_reward_category_active_point 
  ON ms_reward(category_id, is_active, point_required);

-- For driver availability: find available drivers
CREATE INDEX idx_driver_available_verified 
  ON ms_driver(is_available, is_verified);

-- =============================================
-- FULL-TEXT SEARCH INDEXES (Optional)
-- =============================================

-- For searching rewards by name
ALTER TABLE ms_reward 
  ADD FULLTEXT INDEX ft_reward_name (reward_name, description);

-- =============================================
-- PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Analyze tables for query optimization
ANALYZE TABLE ms_user;
ANALYZE TABLE ms_driver;
ANALYZE TABLE ms_vehicle;
ANALYZE TABLE ms_vehicle_category;
ANALYZE TABLE ms_waste_category;
ANALYZE TABLE ms_reward;
ANALYZE TABLE tr_pickup_event;
ANALYZE TABLE tr_pickup;
ANALYZE TABLE tr_pickup_item;
ANALYZE TABLE tr_redemption;
ANALYZE TABLE tr_point_history;

-- Optimize tables
OPTIMIZE TABLE ms_user;
OPTIMIZE TABLE tr_pickup_event;
OPTIMIZE TABLE tr_pickup;
OPTIMIZE TABLE tr_redemption;
