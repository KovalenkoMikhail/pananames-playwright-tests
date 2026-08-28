# Pananames MCP — Playwright tests

Automated UI tests for the Pananames MCP (dev) environment: contacts CRUD and domain search → cart TOTAL checks.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
git clone https://github.com/KovalenkoMikhail/pananames-playwright-tests.git
cd pananames-playwright-tests
npm install
npx playwright install chromium
cp .env.example .env
```

Credentials are **not** in the repository. Put the MCP (dev) account from the assignment into `.env`, then run `npm test`:

```
BASE_URL=https://mcp.pananames-dev.com
MCP_EMAIL=...
MCP_PASSWORD=...
```

If `.env` is missing or still has the example placeholders, setup stops with an error. That is expected — tests cannot log in without a real account.

## Run tests

```bash
npm test
```

Headed / UI mode / HTML report / typecheck:

```bash
npm run test:headed
npm run test:ui
npm run report
npm run typecheck
```

`npm run test:ui` lists every spec. Login runs once in `global-setup.ts` before the suite (not as a test in the sidebar).

On failure Playwright keeps a trace, screenshot, and video:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Structure

```
tests/           specs
pages/           page objects (locators + actions)
fixtures/        Playwright fixtures (POM + cleanup)
utils/           test data, prices, routes, timeouts
```

Login runs once in `global-setup.ts` and is reused via `storageState`. Specs stay independent; cleanup lives in fixtures, not in `beforeEach` / `try/finally`.

## Scenarios

1. **Contacts** (`/contacts`) — independent create / edit / delete. Checkbox state is asserted after save. Default **Primary** and **Abuse** contacts are not modified.
2. **Single domain to cart** (`/register-domain`) — search SLD + TLD, add to cart, assert `TOTAL` equals the search-card price. Repeated for `.com`, `.net`, `.org`.
3. **Multiple domains to cart** — search SLD only (no TLD), add 3 available domains, assert `TOTAL` equals the sum of search prices.

## Why the suite is shaped this way

- **One worker, not parallel.** One shared MCP account and one cart. Fixtures isolate data; extra workers would race the same cart.
- **No `serial` describe.** Cart tests do not depend on each other. If `.com` fails, `.net` still runs.
- **ID Protection off before TOTAL.** On some TLDs protection adds a fee; the assignment compares TOTAL to the search-card price.
- **Contact type/NAME is alphabetic.** The API rejects digits (`The name field format is invalid`).
- **Contact fields by visible label.** Inputs expose `aria-label="$t:inputField"`, so `getByLabel` / `getByRole('textbox')` is not usable.
- **`setChecked(..., { force: true })`.** Vuestic checkbox/switch overlays intercept the pointer; Playwright's check still sets the control.
- **Registration notice.** Some TLDs (e.g. `.net`) require **I AGREE, ADD DOMAIN TO CART** before the domain lands in the cart.
- **Checkout is never clicked.** Cart and extra contacts are removed in fixture teardown.
