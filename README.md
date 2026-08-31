# Pananames MCP — Playwright tests

UI tests for Pananames MCP (dev): contacts CRUD and domain search → cart `TOTAL`.

## Prerequisites

- Node.js 18+
- npm

## Install

From the project root:

```bash
npm install
npx playwright install chromium
```

`npm install` installs packages only. Playwright browsers are downloaded separately — without `playwright install chromium` tests cannot launch a browser. Chromium is enough: the suite has a single Chromium project.

```bash
cp .env.example .env
```

Credentials are **not** in the repository. Put the MCP (dev) account from the assignment into `.env`:

```
BASE_URL=https://mcp.pananames-dev.com
MCP_EMAIL=
MCP_PASSWORD=
```

If `.env` is missing or empty, setup stops with an error. That is expected — tests cannot log in without a real account.

## Run

```bash
npx playwright test
```

or `npm test`.

| Command | What it does |
|---|---|
| `npx playwright test` | headless run |
| `npx playwright test --headed` | headed browser |
| `npx playwright test --ui` | Playwright UI mode |
| `npx playwright show-report` | last HTML report |
| `npm run typecheck` | TypeScript check |

UI mode lists the specs (contacts + cart). Login runs once in `global-setup.ts` before the suite, not as a test in the sidebar.

On failure Playwright keeps a trace, screenshot, and video:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Structure

```
tests/           specs
pages/           page objects (BasePage + locators + actions)
fixtures/        Playwright fixtures (POM + cleanup)
utils/           test data, prices, routes, timeouts
global-setup.ts  login once → storageState
```

Specs stay independent. Cleanup lives in fixtures, not in `beforeEach` / `try/finally`.

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
