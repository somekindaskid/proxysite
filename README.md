# Mullvad Web Proxy

Web proxy that routes HTTP(S) traffic through [Mullvad VPN](https://mullvad.net)'s SOCKS5 relay while the VPN is connected.

> **Disclaimer:** Not affiliated with or endorsed by Mullvad VPN AB.

## Features

- Production-oriented web UI with VPN status
- Outbound routing via Mullvad SOCKS5
- Browse mode with link rewriting
- REST API for programmatic access
- E2E smoke test via Playwright

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Mullvad VPN](https://mullvad.net/download) connected
- SOCKS5 relay ([documentation](https://mullvad.net/en/help/socks5-proxy))

## Install

```bash
git clone https://github.com/YOUR_USERNAME/mullvad-web-proxy.git
cd mullvad-web-proxy
npm install
cp .env.example .env
```

## Run

```bash
npm start
```

Open the app in your browser (default bind: `127.0.0.1` via `PORT` in `.env`).

Production mode (minimal logging, static asset caching):

```bash
NODE_ENV=production npm start
```

Windows PowerShell:

```powershell
$env:NODE_ENV="production"; npm start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Listen port |
| `NODE_ENV` | — | Set to `production` for production behavior |
| `MULLVAD_SOCKS_HOST` | `10.64.0.1` | SOCKS5 host |
| `MULLVAD_SOCKS_PORT` | `1080` | SOCKS5 port |
| `APP_URL` | `http://127.0.0.1:3000` | Base URL for E2E tests |
| `TEST_URL` | `https://am.i.mullvad.net` | URL used in smoke test |
| `HEADLESS` | — | Set to `1` for headless Playwright |

Multihop example: `MULLVAD_SOCKS_HOST=nl-ams-wg-socks5-001.relays.mullvad.net`

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /` | Web application |
| `GET /browse?url=...` | Browse with rewritten links |
| `GET /api/proxy?url=...` | Raw proxied response |
| `GET /api/status` | VPN exit metadata (JSON) |

## Project structure

```
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config.js
│   ├── routes/
│   ├── services/
│   └── lib/
├── public/
│   ├── index.html
│   ├── css/main.css
│   ├── js/main.js
│   └── assets/
├── scripts/e2e/smoke.js
└── .github/workflows/ci.yml
```

## Testing

```bash
npx playwright install chromium
npm run test:e2e
```

Artifacts are written to `.artifacts/` (gitignored).

## Security

Intended for **trusted local or private network** use. Do not expose as a public open proxy without authentication, TLS, and rate limiting.

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
