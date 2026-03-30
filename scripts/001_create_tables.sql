-- Hook License System — full database schema
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS

-- ─── Products ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          varchar(255) NOT NULL,
  description   text,
  product_type  varchar(100) NOT NULL DEFAULT 'OTHER',
  other_product_type varchar(100),
  product_url   text,
  product_image_url text,
  role_id       varchar(100),
  purchase_role_id varchar(100),
  default_max_ips   integer NOT NULL DEFAULT 5,
  default_max_hwids integer NOT NULL DEFAULT 5,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Customers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image        text,
  username             varchar(255),
  first_name           varchar(100),
  last_name            varchar(100),
  email                varchar(255),
  discord_id           varchar(100),
  discord_username     varchar(255),
  builtbybit_id        varchar(100),
  builtbybit_username  varchar(255),
  notes                text,
  status               varchar(50) NOT NULL DEFAULT 'ACTIVE',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── Licenses (extend the existing table) ────────────────────────────────────
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS product_id          uuid REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_id         uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_discord_id    varchar(100),
  ADD COLUMN IF NOT EXISTS owner_discord_username varchar(255),
  ADD COLUMN IF NOT EXISTS owner_username      varchar(255),
  ADD COLUMN IF NOT EXISTS license_platform    varchar(100),
  ADD COLUMN IF NOT EXISTS license_platform_user_id varchar(100),
  ADD COLUMN IF NOT EXISTS license_type        varchar(50) NOT NULL DEFAULT 'PERMANENT',
  ADD COLUMN IF NOT EXISTS max_ips             integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_hwids           integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ips                 text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hwids               text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes               text;

-- Rename existing columns to snake_case if needed (idempotent via DO block)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licenses' AND column_name='license_key' AND table_schema='public') THEN
    -- column already snake_case, nothing to do
    NULL;
  END IF;
END
$$;

-- ─── Requests (license validation log) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key     varchar(255),
  product_id      uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    varchar(255),
  ip_address      varchar(100),
  hwid            varchar(255),
  mac_address     varchar(100),
  operating_system varchar(100),
  os_version      varchar(100),
  os_architecture varchar(50),
  java_version    varchar(50),
  product_version varchar(50),
  request_type    varchar(50) NOT NULL DEFAULT 'Valid',
  response_type   varchar(50) NOT NULL DEFAULT 'Success',
  status          varchar(50) NOT NULL DEFAULT 'Successful',
  request_date    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Blacklists ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blacklists (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_data_type     varchar(50) NOT NULL,   -- HWID | IP | DISCORD_ID
  data                  text NOT NULL,
  is_for_all_products   boolean NOT NULL DEFAULT true,
  product_id            uuid REFERENCES public.products(id) ON DELETE SET NULL,
  reason                text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ─── API Tokens ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(255) NOT NULL,
  token      text NOT NULL UNIQUE,
  intents    text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Admin Users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username      varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          varchar(50) NOT NULL DEFAULT 'admin',
  discord_id    varchar(100),
  last_login    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed default admin user (password: admin123 — change immediately in production)
INSERT INTO public.admin_users (username, password_hash, role)
VALUES ('admin', 'hash:admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ─── Backups ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   varchar(50) NOT NULL,
  note        text,
  type        varchar(20) NOT NULL DEFAULT 'MANUAL',  -- MANUAL | AUTOMATIC
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Settings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  key        varchar(255) PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('rate_limiting',        '{"enabled": true, "maxRequests": 10, "timePeriodMs": 10000}'::jsonb),
  ('discord',              '{"token": "", "adminRole": "", "commandsChannel": "", "licenseRequestsChannel": "", "notificationsChannel": ""}'::jsonb),
  ('oauth',                '{"discordClientId": "", "discordClientSecret": "", "discordRedirectUri": "", "enableDiscordLogin": false, "adminDiscordRoleId": ""}'::jsonb),
  ('builtbybit',           '{"secret": ""}'::jsonb),
  ('disaster_mode',        '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
