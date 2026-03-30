-- SunLicense Database Schema
-- Created for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  discord_id VARCHAR(255) UNIQUE,
  discord_username VARCHAR(255),
  discord_avatar_url TEXT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  buildbybits_id VARCHAR(255),
  buildbybits_username VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  product_type VARCHAR(100) NOT NULL,
  other_product_type VARCHAR(255),
  product_role_id INTEGER,
  product_role_name VARCHAR(255),
  product_purchase_role_id INTEGER,
  product_purchase_role_name VARCHAR(255),
  default_max_ips INTEGER DEFAULT 5,
  default_max_hwids INTEGER DEFAULT 5,
  product_url TEXT,
  product_image_url TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(255) NOT NULL UNIQUE,
  product_id INTEGER NOT NULL,
  owner_user_id UUID,
  owner_discord_id VARCHAR(255),
  owner_discord_username VARCHAR(255),
  license_type VARCHAR(50) NOT NULL DEFAULT 'permanent',
  license_platform VARCHAR(50),
  license_platform_user_id VARCHAR(255),
  max_ips INTEGER DEFAULT 5,
  max_hwids INTEGER DEFAULT 5,
  current_ips TEXT DEFAULT '',
  current_hwids TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'active',
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- License Requests Table (Validation Log)
CREATE TABLE IF NOT EXISTS license_requests (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(255) NOT NULL,
  product_id INTEGER,
  product_version VARCHAR(50),
  user_id UUID,
  ip_address INET,
  hwid VARCHAR(255),
  mac_address VARCHAR(255),
  os_info VARCHAR(255),
  request_type VARCHAR(50) DEFAULT 'validation',
  request_status VARCHAR(50) DEFAULT 'successful',
  is_valid BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Blacklists Table
CREATE TABLE IF NOT EXISTS blacklists (
  id SERIAL PRIMARY KEY,
  license_data_type VARCHAR(50) NOT NULL,
  data VARCHAR(255) NOT NULL,
  is_for_all_products BOOLEAN DEFAULT FALSE,
  product_id INTEGER,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(license_data_type, data, product_id)
);

-- API Tokens Table
CREATE TABLE IF NOT EXISTS api_tokens (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  intents TEXT DEFAULT 'LICENSE_VALIDATE,LICENSES_READ,LICENSES_READ_WRITE,BLACKLISTS_READ,CUSTOMERS_READ,ALL_READ,ALL_READ_WRITE',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  integration_type VARCHAR(50) NOT NULL UNIQUE,
  discord_token TEXT,
  discord_admin_role_id VARCHAR(255),
  discord_admin_role_name VARCHAR(255),
  discord_commands_alert_channel VARCHAR(255),
  discord_notifications_alert_channel VARCHAR(255),
  discord_client_id VARCHAR(255),
  discord_client_secret TEXT,
  buildbybits_webhook_url TEXT,
  buildbybits_webhook_secret TEXT,
  api_base_url TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Backups Table
CREATE TABLE IF NOT EXISTS backups (
  id SERIAL PRIMARY KEY,
  backup_name VARCHAR(255) NOT NULL,
  backup_type VARCHAR(50),
  backup_data JSONB,
  backup_size INTEGER,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  restored_at TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Disaster Mode Table
CREATE TABLE IF NOT EXISTS disaster_mode (
  id SERIAL PRIMARY KEY,
  is_active BOOLEAN DEFAULT FALSE,
  activated_by UUID,
  activated_at TIMESTAMP,
  deactivated_at TIMESTAMP,
  reason TEXT,
  recovery_info JSONB,
  FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_licenses_product_id ON licenses(product_id);
CREATE INDEX idx_licenses_owner_user_id ON licenses(owner_user_id);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_license_requests_license_key ON license_requests(license_key);
CREATE INDEX idx_license_requests_user_id ON license_requests(user_id);
CREATE INDEX idx_license_requests_created_at ON license_requests(created_at);
CREATE INDEX idx_blacklists_data ON blacklists(data);
CREATE INDEX idx_blacklists_product_id ON blacklists(product_id);
CREATE INDEX idx_api_tokens_token ON api_tokens(token);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_backups_created_at ON backups(created_at);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type)
VALUES 
  ('license_key_format', 'XXXX-XXXX-XXXX-XXXX-XXX', 'string'),
  ('app_name', 'SunLicense', 'string'),
  ('app_theme', 'dark', 'string'),
  ('backup_schedule', 'daily', 'string'),
  ('api_rate_limit', '100', 'number'),
  ('session_timeout_minutes', '1440', 'number')
ON CONFLICT (setting_key) DO NOTHING;
