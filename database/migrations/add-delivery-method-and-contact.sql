-- Migration Script: Add delivery_method column and contact_messages table
-- Run this on both LOCAL and VPS databases

USE alexco_db;

-- 1. Add delivery_method column to sales_orders if not exists
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'sales_orders' AND column_name = 'delivery_method');
SET @sql := IF(@exist = 0, 'ALTER TABLE sales_orders ADD COLUMN delivery_method VARCHAR(20) DEFAULT ''delivery''', 'SELECT "Column delivery_method already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Create contact_messages table if not exists
CREATE TABLE IF NOT EXISTS contact_messages (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

SELECT "Migration Complete: delivery_method column and contact_messages table verified." as status;
