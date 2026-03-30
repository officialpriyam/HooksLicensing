import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...');

    // Create tables via SQL
    const { error: schemaError } = await supabase.rpc('exec', {
      sql: `
        -- Admin Users
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Products
        CREATE TABLE IF NOT EXISTS products (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          product_type TEXT NOT NULL,
          other_product_type TEXT,
          product_role_id BIGINT,
          product_purchase_role_id BIGINT,
          default_max_ips INTEGER DEFAULT 5,
          default_max_hwids INTEGER DEFAULT 5,
          product_url TEXT,
          product_image_url TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Licenses
        CREATE TABLE IF NOT EXISTS licenses (
          id BIGSERIAL PRIMARY KEY,
          license_key TEXT UNIQUE NOT NULL,
          product_id BIGINT REFERENCES products(id),
          license_type TEXT NOT NULL DEFAULT 'PERMANENT',
          license_platform TEXT,
          license_platform_user_id TEXT,
          owner_discord_id TEXT,
          owner_discord_username TEXT,
          max_ips INTEGER DEFAULT -1,
          max_hwids INTEGER DEFAULT -1,
          ips TEXT[] DEFAULT ARRAY[]::TEXT[],
          hwids TEXT[] DEFAULT ARRAY[]::TEXT[],
          license_status TEXT DEFAULT 'ACTIVE',
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- License Requests
        CREATE TABLE IF NOT EXISTS license_requests (
          id BIGSERIAL PRIMARY KEY,
          license_key TEXT REFERENCES licenses(license_key),
          product_id BIGINT REFERENCES products(id),
          product_version TEXT,
          ip_address TEXT,
          hwid TEXT,
          mac_address TEXT,
          os TEXT,
          os_version TEXT,
          os_architecture TEXT,
          java_version TEXT,
          request_type TEXT,
          response_type TEXT,
          request_date TIMESTAMP DEFAULT now(),
          status TEXT
        );

        -- Customers
        CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT NOT NULL,
          discord_username TEXT,
          discord_id TEXT UNIQUE,
          buildbybits_user_id TEXT UNIQUE,
          buildbybits_username TEXT,
          profile_image_url TEXT,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          status TEXT DEFAULT 'active',
          notes TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Blacklists
        CREATE TABLE IF NOT EXISTS blacklists (
          id BIGSERIAL PRIMARY KEY,
          license_data_type TEXT NOT NULL,
          data TEXT NOT NULL,
          is_for_all_products BOOLEAN DEFAULT false,
          product_id BIGINT REFERENCES products(id),
          reason TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Integrations
        CREATE TABLE IF NOT EXISTS integrations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          integration_type TEXT NOT NULL,
          config JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- API Tokens
        CREATE TABLE IF NOT EXISTS api_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          intents TEXT[] DEFAULT ARRAY[]::TEXT[],
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Notifications
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT,
          data JSONB,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT now()
        );

        -- System Settings
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          setting_key TEXT UNIQUE NOT NULL,
          setting_value JSONB,
          updated_at TIMESTAMP DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
        CREATE INDEX IF NOT EXISTS idx_licenses_owner_discord_id ON licenses(owner_discord_id);
        CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
        CREATE INDEX IF NOT EXISTS idx_license_requests_license_key ON license_requests(license_key);
        CREATE INDEX IF NOT EXISTS idx_customers_discord_id ON customers(discord_id);
        CREATE INDEX IF NOT EXISTS idx_blacklists_product_id ON blacklists(product_id);
      `
    });

    if (schemaError) {
      console.error('[v0] Schema creation error:', schemaError);
    } else {
      console.log('[v0] Database tables created successfully!');
    }

  } catch (error) {
    console.error('[v0] Setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
