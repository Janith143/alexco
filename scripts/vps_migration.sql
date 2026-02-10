-- 1. Fix Employees Table Schema
-- Add missing columns if they don't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5,2) DEFAULT 8.00,
ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5,2) DEFAULT 12.00,
ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5,2) DEFAULT 3.00,
ADD COLUMN IF NOT EXISTS epf_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS etf_number VARCHAR(50);

-- 2. Insert Missing Permissions
-- using INSERT IGNORE to avoid duplicates
INSERT IGNORE INTO permissions (id, description) VALUES 
('categories.manage', 'Manage Categories'),
('inventory.view', 'View Inventory'),
('inventory.manage', 'Manage Inventory'),
('admin.view', 'Access Admin Dashboard'),
('payroll.view', 'View Payroll'),
('admin.settings', 'Manage Settings'),
('reports.view', 'View Reports');

-- 3. Assign Permissions to Roles (Admin & Super User)
-- We use a stored procedure or just simple INSERT SELECTs to be safe against different UUIDs
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug IN ('admin', 'super_user')
AND p.id IN (
    'categories.manage', 
    'inventory.view', 
    'inventory.manage', 
    'admin.view', 
    'payroll.view', 
    'admin.settings',
    'reports.view'
);
