-- Add operational_area column to ms_driver
ALTER TABLE ms_driver 
ADD COLUMN operational_area VARCHAR(255) NULL AFTER assigned_vehicle_id;

-- Add pickup_regency column to tr_pickup_event
ALTER TABLE tr_pickup_event 
ADD COLUMN pickup_regency VARCHAR(255) NULL AFTER pickup_address;

-- Create index for faster queries
CREATE INDEX idx_driver_operational_area ON ms_driver(operational_area);
CREATE INDEX idx_pickup_event_regency ON tr_pickup_event(pickup_regency);

-- Change default value to 'inactive'
ALTER TABLE ms_vehicle
CHANGE COLUMN status status ENUM('active', 'maintenance', 'inactive') DEFAULT 'inactive';