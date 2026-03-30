-- Seed admin user with username: priyx, password: gannu0
INSERT INTO admin_users (id, username, password_hash, role, discord_id, created_at)
VALUES (
  gen_random_uuid(),
  'priyx',
  'hash:gannu0',
  'admin',
  '',
  NOW()
) ON CONFLICT DO NOTHING;

-- Seed some sample products
INSERT INTO products (id, name, description, product_type, default_max_ips, default_max_hwids, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Premium License', 'Full-featured premium license with all capabilities', 'Software', 5, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Standard License', 'Basic software license for individual use', 'Software', 2, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Enterprise License', 'Unlimited enterprise license for organizations', 'Software', 50, 25, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed some sample customers
INSERT INTO customers (id, username, first_name, last_name, email, discord_id, discord_username, status, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'john_doe', 'John', 'Doe', 'john@example.com', '123456789', 'john#1234', 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'jane_smith', 'Jane', 'Smith', 'jane@example.com', '987654321', 'jane#5678', 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'bob_wilson', 'Bob', 'Wilson', 'bob@example.com', '555555555', 'bob#9999', 'ACTIVE', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed a sample license
INSERT INTO licenses (id, license_key, product_name, customer_name, customer_email, owner_username, owner_discord_username, license_type, status, max_ips, max_hwids, ips, hwids, issue_date, expiry_date, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'XXXX-YYYY-ZZZZ-AAAA-BBBB', 'Premium License', 'John Doe', 'john@example.com', 'john_doe', 'john#1234', 'PERMANENT', 'active', 5, 3, ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW() + INTERVAL '1 year', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed some sample API tokens
INSERT INTO api_tokens (id, name, token, intents, created_at)
VALUES
  (gen_random_uuid(), 'Default API Token', 'api_token_sample_12345', ARRAY['validate', 'generate'], NOW())
ON CONFLICT DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value, updated_at)
VALUES
  ('general', '{"siteName": "Hook License System", "timezone": "UTC"}', NOW()),
  ('oauth', '{"enableDiscordLogin": false}', NOW())
ON CONFLICT (key) DO NOTHING;
