ALTER TABLE ms_subscription_plan 
ADD COLUMN is_tentative_price BOOLEAN DEFAULT FALSE COMMENT 'If true, price is not fixed and requires consultation';

-- Allow NULL for price column (for tentative price plans)
ALTER TABLE ms_subscription_plan 
MODIFY COLUMN price DECIMAL(15, 2) NULL;