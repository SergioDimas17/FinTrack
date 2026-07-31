# FinTrack — Security Module (OWASP ZAP)

Automated security scanning for the FinTrack API using [OWASP ZAP](https://www.zaproxy.org/).

## Prerequisites

### Option A — Docker (recommended, simplest)
1. **Docker** installed and running.
   ```bash
   docker --version
   ```
2. Pull the ZAP image (done automatically on first run):
   ```bash
   docker pull owasp/zap2docker-stable
   ```

### Option B — Python script (ZAP daemon mode)
1. **ZAP installed** locally and runnable as a daemon.
2. **Python 3.7+**.
3. **zap-api-python** package:
   ```bash
   pip install python-owasp-zap-v2.4
   ```

## Target

The default target is the FinTrack QA Supabase API:
```
https://wlsxfjlaxxwgnbhmtgmw.supabase.co
```
Override it with a positional argument or the `ZAP_TARGET_URL` environment variable.

## Running the Scan

### 1. Docker baseline scan (recommended)

From the `security/zap/scripts/` directory:

```bash
# Using the default FinTrack QA URL
./run-zap-scan.sh

# Using a custom target URL (positional argument)
./run-zap-scan.sh https://your-target.example.com

# Using an environment variable
ZAP_TARGET_URL="https://your-target.example.com" ./run-zap-scan.sh
```

The HTML report is saved to `security/zap/reports/zap-report_<timestamp>.html`.

### 2. Python active scan (ZAP daemon mode)

First, start the ZAP daemon with the API enabled:

```bash
zap.sh -daemon -port 8080 -host 127.0.0.1 \
    -config api.key=changeme \
    -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true
```

Then run the Python script:

```bash
ZAP_TARGET_URL="https://wlsxfjlaxxwgnbhmtgmw.supabase.co" \
ZAP_API_PORT=8080 \
ZAP_API_KEY=changeme \
python3 zap-baseline-scan.py
```

The script will:
1. Access the target so ZAP learns about it.
2. Spider the target to discover endpoints.
3. Run an active scan.
4. Save an HTML report to `security/zap/reports/`.
5. Print a summary of alerts to the console.

## Scan Policy

`config/zap-policy.xml` defines which active scan rules are enabled and their
thresholds. The default policy uses a **medium** threshold and **medium**
strength to balance coverage with false positives during QA runs.

To use a custom policy with the Docker baseline scan, pass `-c` to `zap-baseline.py`
by editing `run-zap-scan.sh`:

```bash
zap-baseline.py -t "$TARGET_URL" -r "$REPORT_FILE" -c /zap/wrk/zap-policy.xml -I
```
and mount the config directory accordingly.

## Reports

All HTML reports are written to `security/zap/reports/`.
Open any `.html` file in a browser to review findings.

## Notes

- **Run scans only against QA/test environments**, never against production
  unless you have explicit authorization. Active scans send attack payloads.
- The baseline scan (`zap-baseline.py`) is **passive** by default — it does not
  send attack payloads. The Python script (`zap-baseline-scan.py`) runs an
  **active** scan, which is more thorough but more intrusive.
- Review and triage all alerts manually — ZAP reports include false positives.
