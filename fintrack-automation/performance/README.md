# FinTrack — Performance Module (k6)

Load, stress, smoke, and spike tests for the FinTrack API using [k6](https://k6.io/).

## Prerequisites

1. **k6 installed** — https://k6.io/docs/getting-started/installation/
   Verify with:
   ```bash
   k6 version
   ```

2. **Environment variables** — set these before running any script:

   | Variable           | Description                                  | Example                                  |
   |--------------------|----------------------------------------------|------------------------------------------|
   | `K6_ANON_KEY`      | Supabase anon/public key (QA project)        | `eyJhbGciOi...`                          |
   | `K6_TEST_EMAIL`    | Test user email                              | `pruebasQA@gmail.com`                    |
   | `K6_TEST_PASSWORD` | Test user password                           | `your-qa-password`                       |
   | `BASE_URL`         | (Optional) Override the Supabase QA URL      | `https://wlsxfjlaxxwgnbhmtgmw.supabase.co` |

   Quick export:
   ```bash
   export K6_ANON_KEY="your-anon-key"
   export K6_TEST_EMAIL="pruebasQA@gmail.com"
   export K6_TEST_PASSWORD="your-qa-password"
   ```

## Test Scripts

All scripts live in `scripts/`. Reports can be exported to `reports/` using k6's `--out` flag.

### 1. Smoke test — `smoke.js`
Minimal load (2 VUs for 1 min). Verifies the API is up: auth login + GET accounts.

```bash
k6 run scripts/smoke.js
```

### 2. Load test — `load.js`
Normal expected traffic. Ramps 10 → 20 VUs over 3 minutes. Full flow: auth + accounts + transfer.

```bash
k6 run scripts/load.js
```

### 3. Stress test — `stress.js`
Pushes load to find the breaking point. Ramps 0 → 50 → 100 VUs over 5 minutes.

```bash
k6 run scripts/stress.js
```

### 4. Spike test — `spike.js`
Sudden traffic burst: 0 → 100 VUs instantly, hold 30s, drop to 0.

```bash
k6 run scripts/spike.js
```

## Exporting Reports

Save results as JSON or to a file for later analysis:

```bash
# JSON summary
k6 run --out json=reports/load-results.json scripts/load.js

# Human-readable summary on screen + JSON
k6 run --out json=reports/load-results.json scripts/load.js | tee reports/load-summary.txt
```

## Endpoints Covered

| Method | Endpoint                                              | Purpose            |
|--------|-------------------------------------------------------|--------------------|
| POST   | `/auth/v1/token?grant_type=password`                 | User login         |
| GET    | `/functions/v1/banking-api/accounts`                 | List accounts      |
| POST   | `/functions/v1/transfer`                              | Create a transfer  |

## Test Data

`data/test-users.json` contains the QA test user. Passwords are placeholders —
always pass the real password via the `K6_TEST_PASSWORD` environment variable.

## Thresholds Summary

| Script   | VUs         | Duration | Max failure rate | p95 latency |
|----------|-------------|----------|------------------|-------------|
| smoke    | 2           | 1m       | <1%              | <2s         |
| load     | 10 → 20     | 3m       | <5%              | <3s         |
| stress   | 50 → 100    | 5m       | <20%             | <5s         |
| spike    | 0 → 100 → 0 | 30s      | <30%             | <8s         |
