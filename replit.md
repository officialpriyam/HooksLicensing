# Hook License System

A Next.js 16 admin dashboard for managing software licenses, customers, and integrations, with a companion Discord bot.

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Notifications**: Sonner toast
- **Database**: Supabase (PostgreSQL)

## Key Pages
- `/admin` – Dashboard with live chart, stat cards, Discord bot banner
- `/admin/licenses` – License CRUD with search and filtering
- `/admin/products` – Product management
- `/admin/customers` – Customer management
- `/admin/integrations` – Discord bot, BuiltByBit, Custom Store, API tokens
- `/admin/settings` – Security and system settings
- `/admin/requests` – License validation request logs
- `/customer` – Customer-facing portal
- `/docs/builtbybit` – BuiltByBit integration step-by-step guide

## Integrations Page Features
- **Discord**: Bot token, Bot API URL, Admin role management, Channel IDs for alerts, OAuth2 setup
- **BuiltByBit**: Webhook URL auto-generation per product, secret generation, auto-license-on-purchase flow. "View Setup Guide" links to `/docs/builtbybit`
- **Custom Store**: API secret, store API URL, webhook endpoint, integration guide (PHP/TS/JS)
- **API**: Token management (create/delete with intents)

## Discord Bot (`hookdiscordbot/`)
Standalone Discord bot that integrates with the Hook License System REST API.

### Setup
1. Edit `hookdiscordbot/config/config.yml` — fill in Token, GuildId, AdminRoles, ApiSettings.Url, ApiSettings.Token
2. Start the **Discord Bot** workflow from the Replit workflow panel

### Commands — General
| Command | Description |
|---|---|
| `/help` | Full command reference |
| `/info` | Bot stats + system overview |
| `/mylicenses` | View your linked license keys |
| `/redeem <key>` | Link a license key to your Discord account |
| `/verify <key>` | Check if a license is valid without claiming it |
| `/clearmyhwids` | Clear hardware IDs from your licenses |
| `/clearmyips` | Clear IP addresses from your licenses |
| `/stats overview\|licenses` | View system statistics |

### Commands — Admin
| Command | Description |
|---|---|
| `/lookup key <key>` | Look up a license by key |
| `/lookup user <member>` | Look up all licenses for a user |
| `/activate activate\|ban <key>` | Activate or ban a license |
| `/transfer <key> <user>` | Transfer a license between users |
| `/announce <channel> <title> <msg>` | Send announcement to configured channel |
| `/customer <user>` | View full customer profile and licenses |
| `/license create\|delete\|list\|cleardata` | Full license management |
| `/product create\|delete` | Product management |
| `/blacklist add\|remove` | IP/HWID blacklist management |

### Notification Channels (config.yml)
- `CommandAlerts` – Admin command activity
- `LicenseAlerts` – Validation successes/failures, bans, expirations
- `Notifications` – General announcements
- `SalesAlerts` – Purchases and license deliveries
- `BlacklistAlerts` – New blacklist entries
- `SystemAlerts` – Bot startup and system events

### Webhook Events (received from main app on port 3001)
- `POST /events/license-request` – Validation result
- `POST /events/command-executed` – Admin command log
- `POST /events/license-obtained` – DM delivery + sales alert
- `POST /events/license-banned` – Ban notification
- `POST /events/license-expired` – Expiry notification
- `POST /events/blacklist-added` – Blacklist alert
- `POST /events/purchase` – New purchase alert
- `POST /events/notification` – General notification
- `POST /events/system` – System alert

## BuiltByBit Integration Docs
Full step-by-step guide at `/docs/builtbybit`:
1. Get the Webhook URL from Integrations → BuiltByBit
2. Create an External License Key placeholder in BuiltByBit with the URL and secret
3. Use `%%MyProduct_License%%` as the license key variable in your product
4. Licenses are auto-created and delivered on purchase

## Dev
```
pnpm run dev   # main app on port 5000
cd hookdiscordbot && pnpm run start   # discord bot (separate process)
```
Default admin credentials: `admin / admin123`
