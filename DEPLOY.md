# UAPP Deployment Runbook

## Prerequisites

- VPS: Hostinger KVM2 (`srv940848.hstgr.cloud`) with Docker + Traefik running
- Domain: DNS A record pointing `uapp.yourdomain.com` to VPS IP
- Repo cloned at `~/programmatic-company` on VPS

## Step 1: Set up environment variables

```bash
cd ~/programmatic-company
cp .env.example .env
nano .env
```

Fill in your real values:

| Variable | Where to get it |
|----------|----------------|
| `UAPP_API_KEY` | Generate one: `openssl rand -hex 32` |
| `DOMAIN` | Your domain (e.g. `yourdomain.com`) |
| `GHL_API_KEY` | GHL Settings → API Keys |
| `GHL_LOCATION_ID` | GHL sub-account ID |
| `ONTRAPORT_API_KEY` | Ontraport → Admin → API Settings |
| `ONTRAPORT_APP_ID` | Same page as API key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `MIGHTY_API_KEY` | Mighty Networks admin panel |
| `MIGHTY_COMMUNITY_ID` | From your Mighty community URL |
| `RETREATGURU_API_KEY` | RetreatGuru → Settings → API |
| `TELEGRAM_BOT_TOKEN` | Talk to @BotFather on Telegram |
| `TELEGRAM_ALLOWED_CHAT_IDS` | Your Telegram user ID (get from @userinfobot) |

## Step 2: Build and start

```bash
docker compose up -d --build
```

Verify it's running:

```bash
docker compose logs -f uapp
# Should see: "UAPP Router running on http://localhost:3100"

# Test health endpoint
curl http://localhost:3100/health
```

## Step 3: Verify Traefik routing

If Traefik is already running on the VPS, the labels in docker-compose.yml
will auto-register the route. Test:

```bash
curl https://uapp.yourdomain.com/health
```

If Traefik is NOT running, the router is accessible at `http://VPS_IP:3100`.

## Step 4: Register Telegram webhook

```bash
curl -X POST https://uapp.yourdomain.com/webhook/telegram/setup \
  -H "X-API-Key: YOUR_UAPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"webhook_url": "https://uapp.yourdomain.com/webhook/telegram"}'
```

Test by sending a message to your bot on Telegram:
- `/help` — should show command list
- `/status` — should show pipeline health
- `list clients` — should route through BuilderBee

## Step 5: Verify the full pipeline

```bash
# Test the router API directly
curl -X POST https://uapp.yourdomain.com/route \
  -H "X-API-Key: YOUR_UAPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target": "centaurion", "command": "pipeline.health"}'

# Check monitoring
curl https://uapp.yourdomain.com/monitoring \
  -H "X-API-Key: YOUR_UAPP_API_KEY"

# Check mission control
curl https://uapp.yourdomain.com/mission-control \
  -H "X-API-Key: YOUR_UAPP_API_KEY"
```

## Updating

After pulling new code:

```bash
cd ~/programmatic-company
git pull
docker compose up -d --build
```

## Troubleshooting

### Container won't start
```bash
docker compose logs uapp
# Check for missing env vars or build errors
```

### Telegram bot not responding
```bash
# Check webhook is registered
curl https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo

# Check logs for incoming messages
docker compose logs -f uapp | grep telegram
```

### API returns 401
Your `UAPP_API_KEY` in `.env` must match the `X-API-Key` header in requests.

### API returns 429
Rate limited. Default: 100 requests/minute per API key. Wait 60 seconds.
