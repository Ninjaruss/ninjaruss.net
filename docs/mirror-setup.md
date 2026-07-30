# Mirror live setup (one-time)

1. Create a fine-grained GitHub PAT: github.com → Settings → Developer settings
   → Fine-grained tokens → only repository `Ninjaruss/ninjaruss.net`,
   Repository permissions → Contents: Read and write. Copy it.
2. Invent a mirror key (any long random string — this is what you'll type on
   your devices).
3. Vercel → ninjaruss.net project → Settings → Environment Variables →
   add `MIRROR_GITHUB_TOKEN` (the PAT) and `MIRROR_TOKEN` (your key),
   Production scope → Save → redeploy.
4. On each of your devices: open ninjaruss.net/status, tap the MIRROR label
   3 times, enter your key once.

Loop: ▶ / ★ capture anywhere → ⧉ copy DeepSeek prompt → paste into DeepSeek →
copy its reply → import reply → the site commits + rebuilds itself (~1 min).
Wrong key? The strip tells you and asks again on the next triple-tap.
Revert a bad session: `git revert` the "mirror: add session …" commit.
