# tools/

Operational utilities for HyperDAG Protocol services.

## zkp-postcard-monitor

Lightweight uptime probe for the zkp-postcard Railway service. Polls `/health`
and issues a test `/zkp/repid-proof` call on an interval, writing anomalies
(non-healthy status, request failures, slow proving time) to a log file.

Two equivalent implementations are provided; pick whichever matches the host.

### Windows (PowerShell)

```powershell
# Default: production URL, 60s interval, log in this directory.
.\zkp-postcard-monitor.ps1

# Customized.
.\zkp-postcard-monitor.ps1 -BaseUrl "https://..." -IntervalSec 30 -ProvingTimeWarnMs 200 -LogPath "C:\logs\zkp.log"
```

Background via Task Scheduler:
1. Create a Basic Task → Trigger: At system startup.
2. Action: Start a program → `powershell.exe`
3. Arguments: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\Cash4\repos\hyperdag-protocol\tools\zkp-postcard-monitor.ps1"`

### Linux / macOS / WSL / Git Bash (bash + curl + jq)

```bash
./zkp-postcard-monitor.sh

# Env-var overrides.
BASE_URL="https://..." INTERVAL_SEC=30 PROVING_TIME_WARN_MS=200 ./zkp-postcard-monitor.sh
```

Background via systemd user unit:

```ini
# ~/.config/systemd/user/zkp-postcard-monitor.service
[Unit]
Description=zkp-postcard uptime monitor

[Service]
ExecStart=/absolute/path/to/zkp-postcard-monitor.sh
Restart=on-failure

[Install]
WantedBy=default.target
```

Then `systemctl --user enable --now zkp-postcard-monitor`.

### Behavior

- Every `INTERVAL_SEC` (default 60):
  - `GET /health` — anomaly if non-200 or `status != "healthy"`.
  - `POST /zkp/repid-proof` with `{"rep_id": 500}` — anomaly if non-200; WARN if `proving_time_ms > PROVING_TIME_WARN_MS` (default 100).
- Anomalies are printed to stdout and appended to the log file.
- Runs until Ctrl-C (interactive) or service stop (background).
