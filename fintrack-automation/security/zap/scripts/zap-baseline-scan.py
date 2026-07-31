#!/usr/bin/env python3
"""
zap-baseline-scan.py

Connects to a running ZAP daemon (or starts one via the ZAP API) and runs an
active scan against the FinTrack API target, then exports an HTML report.

Prerequisites:
    - ZAP running with the API enabled, e.g.:
        zap.sh -daemon -port 8080 -host 127.0.0.1 \
            -config api.key=changeme \
            -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true
    - Python 3.7+
    - zap-api-python package:  pip install python-owasp-zap-v2.4

Environment variables:
    ZAP_TARGET_URL   (required) Target URL to scan.
    ZAP_API_HOST     (optional) ZAP API host. Default: 127.0.0.1
    ZAP_API_PORT     (optional) ZAP API port. Default: 8080
    ZAP_API_KEY      (optional) ZAP API key. Default: "" (no key)

Usage:
    ZAP_TARGET_URL="https://wlsxfjlaxxwgnbhmtgmw.supabase.co" \
    python3 zap-baseline-scan.py
"""

import os
import sys
import time
from datetime import datetime

try:
    from zapv2 import ZAPv2
except ImportError:
    print(
        "ERROR: python-owasp-zap-v2.4 is not installed.\n"
        "Install it with:  pip install python-owasp-zap-v2.4"
    )
    sys.exit(1)


# --- Configuration from environment -----------------------------------------
TARGET_URL = os.environ.get("ZAP_TARGET_URL")
API_HOST = os.environ.get("ZAP_API_HOST", "127.0.0.1")
API_PORT = int(os.environ.get("ZAP_API_PORT", "8080"))
API_KEY = os.environ.get("ZAP_API_KEY", "")

if not TARGET_URL:
    print("ERROR: ZAP_TARGET_URL environment variable is required.")
    sys.exit(1)

# --- Report path -------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(SCRIPT_DIR, "..", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
REPORT_PATH = os.path.join(REPORTS_DIR, f"zap-report_{TIMESTAMP}.html")


def main():
    print(f"Target URL : {TARGET_URL}")
    print(f"ZAP API    : http://{API_HOST}:{API_PORT}")

    # 1. Connect to the ZAP daemon
    zap = ZAPv2(
        apikey=API_KEY,
        proxies={"http": f"http://{API_HOST}:{API_PORT}",
                 "https": f"http://{API_HOST}:{API_PORT}"},
    )

    # 2. Access the target so ZAP learns about it
    print("Accessing target...")
    zap.urlopen(TARGET_URL)
    time.sleep(2)

    # 3. Spider the target to discover endpoints
    print("Spidering target...")
    spider_id = zap.spider.scan(TARGET_URL)
    print(f"Spider scan ID: {spider_id}")

    # Wait for the spider to finish
    while int(zap.spider.status(spider_id)) < 100:
        print(f"Spider progress: {zap.spider.status(spider_id)}%")
        time.sleep(2)
    print("Spider complete.")

    # 4. Run the active scan
    print("Starting active scan...")
    scan_id = zap.ascan.scan(TARGET_URL)
    print(f"Active scan ID: {scan_id}")

    while int(zap.ascan.status(scan_id)) < 100:
        print(f"Active scan progress: {zap.ascan.status(scan_id)}%")
        time.sleep(5)
    print("Active scan complete.")

    # 5. Generate the HTML report
    print("Generating HTML report...")
    html_report = zap.core.htmlreport()
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(html_report)

    print(f"\nReport saved to: {REPORT_PATH}")

    # 6. Print a short summary of alerts
    alerts = zap.core.alerts()
    print(f"\nTotal alerts found: {len(alerts)}")
    for alert in alerts:
        print(f"  [{alert.get('risk')}] {alert.get('alert')} -> {alert.get('url')}")


if __name__ == "__main__":
    main()
