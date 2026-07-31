#!/usr/bin/env bash
#
# run-zap-scan.sh
# Runs an OWASP ZAP baseline scan against the FinTrack API using the official
# owasp/zap2docker-stable Docker image.
#
# Usage:
#   ./run-zap-scan.sh [TARGET_URL]
#
# Environment variables:
#   ZAP_TARGET_URL  (optional) Target URL to scan. Overrides the positional arg.
#
# Prerequisites:
#   - Docker installed and running
#

set -euo pipefail

# --- Resolve target URL -----------------------------------------------------
# Priority: positional argument > ZAP_TARGET_URL env > default FinTrack QA URL
DEFAULT_TARGET="https://wlsxfjlaxxwgnbhmtgmw.supabase.co"
TARGET_URL="${1:-${ZAP_TARGET_URL:-$DEFAULT_TARGET}}"

if [ -z "$TARGET_URL" ]; then
  echo "ERROR: No target URL provided. Pass it as an argument or set ZAP_TARGET_URL."
  exit 1
fi

echo "Target URL: $TARGET_URL"

# --- Paths -------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORTS_DIR="${SCRIPT_DIR}/reports"
mkdir -p "$REPORTS_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="zap-report_${TIMESTAMP}.html"
REPORT_PATH="${REPORTS_DIR}/${REPORT_FILE}"

# The ZAP Docker container writes reports to /zap/wrk, which we mount to our
# local reports directory.
DOCKER_WORKDIR="/zap/wrk"

# --- Run the baseline scan ---------------------------------------------------
echo "Starting ZAP baseline scan..."
echo "Report will be saved to: ${REPORT_PATH}"
echo ""

docker run \
  --rm \
  -v "${REPORTS_DIR}:/zap/wrk":rw \
  owasp/zap2docker-stable \
  zap-baseline.py \
    -t "$TARGET_URL" \
    -r "$REPORT_FILE" \
    -I

echo ""
echo "Scan complete."
echo "HTML report: ${REPORT_PATH}"
