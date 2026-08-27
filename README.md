# Pananames MCP — Playwright tests

Automated UI tests for the Pananames MCP (dev) environment: contacts CRUD and domain search → cart TOTAL checks.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Fill `.env` with the test account credentials (do not commit this file):

```
BASE_URL=https://mcp.pananames-dev.com
MCP_EMAIL=your-email@example.com
MCP_PASSWORD=your-password
```

## Run tests

```bash
npm test
```

Headed / UI mode:

```bash
npm run test:headed
npm run test:ui
```

HTML report:

```bash
npm run report
```

Tests run sequentially on Chromium (`workers: 1`) because they share one account and one cart. Login is done once via `storageState` (`tests/auth.setup.ts`).

## Scenarios

1. **Contacts** (`/contacts`) — three independent tests: create, edit, delete. Checkbox state is asserted after save. Default **Primary** and **Abuse** contacts are not modified.
2. **Single domain to cart** (`/register-domain`) — search `SLD` + TLD, add to cart, assert cart `TOTAL` equals the search-card price. Repeated for `.com`, `.net`, `.org`. ID Protection is turned off before comparing totals. `.net` (and some other zones) may show a registration notice; the test accepts it.
3. **Multiple domains to cart** — search SLD only (no TLD), add 3 available domains, assert `TOTAL` equals the sum of search prices.

Cart tests clear the cart before and after each run. Checkout is never clicked.
