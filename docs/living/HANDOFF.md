# HANDOFF — init-pai (XC)

STAMP: **READY FOR CC**

**claim:** `node scripts/init-pai.mjs --name pai-night-1 --answers "write weekly research|wasted hours|grok"` exits 0 and writes `.trustshell/credentials.json` + `profile.json`. Four answers cap at 3 (no 4th question). `.trustshell/` already gitignored.

**evidence:** https://github.com/DealAppSeo/trustshell/pull/128 · `ff2cc99`
Measured: Paris PASS, Rome VETO + "Harness blocked a false claim before you saw it."

**check:**
```
node --test tests/interview.test.mjs
node scripts/init-pai.mjs --name pai-night-1 --answers "write weekly research|wasted hours|grok"
```
Expect exit 0, both JSON files under `.trustshell/` (gitignored). Then:
```
node scripts/init-pai.mjs --name pai-night-1 --answers "a|b|c|d"
```
Stdout has no 4th question.

**scan:** did not rewrite MCP present_proof, envelope, or #126. gitignore already had `.trustshell/`.

**next if PASS:** CC stamps. No npm publish.
