#!/usr/bin/env bash
# Uptime monitor for zkp-postcard Railway service.
# Every INTERVAL_SEC: probe /health (200 or log anomaly), POST /zkp/repid-proof
# (warn if proving_time_ms > PROVING_TIME_WARN_MS). Runs forever. Ctrl-C to stop.
#
# Requires: curl, jq.

set -u

BASE_URL="${BASE_URL:-https://zkp-postcard-production.up.railway.app}"
LOG_PATH="${LOG_PATH:-$(dirname "$0")/zkp-postcard-monitor.log}"
INTERVAL_SEC="${INTERVAL_SEC:-60}"
PROVING_TIME_WARN_MS="${PROVING_TIME_WARN_MS:-100}"

log_anomaly() {
    local level="$1"; shift
    local ts
    ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    local line="[$ts] [$level] $*"
    printf '%s\n' "$line"
    printf '%s\n' "$line" >> "$LOG_PATH"
}

echo "zkp-postcard monitor starting — base=$BASE_URL interval=${INTERVAL_SEC}s log=$LOG_PATH"
echo "Ctrl-C to stop."

while true; do
    started="$(date +%s)"

    health_body="$(curl -fsS --max-time 10 "$BASE_URL/health" 2>&1)" || {
        log_anomaly "ERROR" "/health request failed: $health_body"
        health_body=""
    }
    if [[ -n "$health_body" ]]; then
        status="$(printf '%s' "$health_body" | jq -r '.status // "unknown"' 2>/dev/null || echo "parse_error")"
        if [[ "$status" != "healthy" ]]; then
            log_anomaly "WARN" "/health status not healthy: $health_body"
        fi
    fi

    proof_body="$(curl -fsS --max-time 30 -H 'Content-Type: application/json' -d '{"rep_id":500}' "$BASE_URL/zkp/repid-proof" 2>&1)" || {
        log_anomaly "ERROR" "/zkp/repid-proof request failed: $proof_body"
        proof_body=""
    }
    if [[ -n "$proof_body" ]]; then
        ptime="$(printf '%s' "$proof_body" | jq -r '.proving_time_ms // empty' 2>/dev/null)"
        if [[ -n "$ptime" && "$ptime" =~ ^[0-9]+$ && "$ptime" -gt "$PROVING_TIME_WARN_MS" ]]; then
            log_anomaly "WARN" "proving_time_ms=$ptime exceeds threshold $PROVING_TIME_WARN_MS"
        fi
    fi

    now="$(date +%s)"
    elapsed=$((now - started))
    sleep_for=$((INTERVAL_SEC - elapsed))
    if (( sleep_for < 1 )); then sleep_for=1; fi
    sleep "$sleep_for"
done
