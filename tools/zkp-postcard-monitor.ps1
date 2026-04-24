#Requires -Version 5.1
<#
.SYNOPSIS
    Uptime monitor for zkp-postcard Railway service.
.DESCRIPTION
    Every 60s: probe /health (200 or log anomaly), POST /zkp/repid-proof
    (warn if proving_time_ms > 100). Runs forever. Ctrl-C to stop.
.PARAMETER BaseUrl
    Service base URL. Defaults to production.
.PARAMETER LogPath
    Path for anomaly log. Defaults to ./zkp-postcard-monitor.log next to the script.
.PARAMETER IntervalSec
    Seconds between probes. Default 60.
.PARAMETER ProvingTimeWarnMs
    Warn threshold for proving_time_ms. Default 100.
.EXAMPLE
    .\zkp-postcard-monitor.ps1
.EXAMPLE
    .\zkp-postcard-monitor.ps1 -BaseUrl "https://staging.example.com" -IntervalSec 30
#>
[CmdletBinding()]
param(
    [string]$BaseUrl = "https://zkp-postcard-production.up.railway.app",
    [string]$LogPath = (Join-Path $PSScriptRoot "zkp-postcard-monitor.log"),
    [int]$IntervalSec = 60,
    [int]$ProvingTimeWarnMs = 100
)

function Write-Anomaly {
    param([string]$Level, [string]$Message)
    $ts = (Get-Date).ToString("o")
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $LogPath -Value $line -Encoding utf8
}

Write-Host "zkp-postcard monitor starting — base=$BaseUrl interval=${IntervalSec}s log=$LogPath"
Write-Host "Ctrl-C to stop."

while ($true) {
    $probeStart = Get-Date

    try {
        $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
        if ($health.status -ne "healthy") {
            Write-Anomaly "WARN" "/health status not healthy: $($health | ConvertTo-Json -Compress)"
        }
    } catch {
        Write-Anomaly "ERROR" "/health request failed: $($_.Exception.Message)"
    }

    try {
        $body = @{ rep_id = 500 } | ConvertTo-Json -Compress
        $proof = Invoke-RestMethod -Uri "$BaseUrl/zkp/repid-proof" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30 -ErrorAction Stop
        if ($null -ne $proof.proving_time_ms -and $proof.proving_time_ms -gt $ProvingTimeWarnMs) {
            Write-Anomaly "WARN" "proving_time_ms=$($proof.proving_time_ms) exceeds threshold $ProvingTimeWarnMs"
        }
    } catch {
        Write-Anomaly "ERROR" "/zkp/repid-proof request failed: $($_.Exception.Message)"
    }

    $elapsed = (New-TimeSpan -Start $probeStart -End (Get-Date)).TotalSeconds
    $sleepFor = [Math]::Max(1, $IntervalSec - [int]$elapsed)
    Start-Sleep -Seconds $sleepFor
}
