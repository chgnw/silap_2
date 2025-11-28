CREATE TABLE IF NOT EXISTS ms_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    reward_name VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(100),
    image_path VARCHAR(255),
    points_required INT NOT NULL,      
    total_redeemed INT DEFAULT 0,      
    stock INT DEFAULT 100,             
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ms_reward_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_redemptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    points_per_item INT NOT NULL,
    quantity INT NOT NULL,
    total_points_spent INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
