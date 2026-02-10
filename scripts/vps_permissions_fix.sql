-- VPS Permissions Fix - Dedicated Script
-- Run: mysql -u root -p alexco_db -f < scripts/vps_permissions_fix.sql

-- 1. Ensure Permissions Exist (Using REPLACE to force them in)
REPLACE INTO permissions (id, description) VALUES ('categories.manage', 'Manage Categories');
REPLACE INTO permissions (id, description) VALUES ('inventory.view', 'View Inventory');
REPLACE INTO permissions (id, description) VALUES ('inventory.manage', 'Manage Inventory');
REPLACE INTO permissions (id, description) VALUES ('admin.view', 'Access Admin Dashboard');
REPLACE INTO permissions (id, description) VALUES ('payroll.view', 'View Payroll');
REPLACE INTO permissions (id, description) VALUES ('admin.settings', 'Manage Settings');
REPLACE INTO permissions (id, description) VALUES ('reports.view', 'View Reports');

-- 2. Clear old/bad links for these specific roles and permissions to avoid duplicates/confusion
-- (Optional, but cleaner if we are re-seeding)
DELETE FROM role_permissions 
WHERE role_id IN (SELECT id FROM roles WHERE slug IN ('admin', 'super_user'))
AND permission_id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 3. Link Admin Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'admin'
AND p.id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 4. Link Super User Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'super_user'
AND p.id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 5. Verification Output
SELECT "--- VERIFICATION ---" as Status;
SELECT r.slug as Role, p.id as Permission
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.slug IN ('admin', 'super_user')
ORDER BY r.slug, p.id;
