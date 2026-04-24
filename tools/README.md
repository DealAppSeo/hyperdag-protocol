# DealAppSeo Repo Audit Utility

This tool generates a single source of truth Markdown table containing the current state of all DealAppSeo repositories on GitHub, including private ones if the environment is authenticated or if they exist locally.

## What it does
- Scans the GitHub API for all repositories under the DealAppSeo organization.
- Scans the local `C:\Users\Cash4\repos` directory for any private repositories that might be missing from the public API list.
- Gathers the default branch, visibility, stars, PR count, last commit date, and a brief description.
- Outputs a formatted Markdown table to `docs/repo-inventory-YYYY-MM-DD.md`.

## How to run it

```bash
node fetch-repos.js
```

## Environment Variables
- `GITHUB_TOKEN` (optional): If provided, the script can fetch private repositories directly via the GitHub API and bypass rate limits. Without it, the script falls back to querying local git configurations to find private repos.

## Output
The script produces a Markdown file in the `docs/` directory, for example: `docs/repo-inventory-2026-04-23.md`.
