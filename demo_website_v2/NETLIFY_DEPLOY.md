# Netlify Deployment Guide

This guide deploys the AI Hackathon template (Next.js static export + Netlify Functions proxy to Hugging Face) to Netlify.

The project root (with `package.json`) is here:
```
C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2
```

Key files:
- `package.json` (Next.js 15, build scripts)
- `next.config.ts` with `output: "export"`
- `netlify/functions/chat.ts` (serverless proxy to Hugging Face Router)
- `netlify.toml` (build, functions, environment, redirects)

---

## 1) One-time: Push to GitHub

1. Initialize a Git repo (if not already):
   ```powershell
   cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2"
   git init
   git add .
   git commit -m "Initial hackathon template"
   ```
2. Create a GitHub repo (e.g., `demo_website_v2`) and push:
   ```powershell
   git remote add origin https://github.com/<your_user>/demo_website_v2.git
   git branch -M main
   git push -u origin main
   ```

Note: If you instead push from the parent folder that contains an inner `demo_website_v2/` directory, then in Netlify you must set Base directory to `demo_website_v2`. Otherwise, deploy from the inner directory as the repo root (recommended).

---

## 2) Configure Environment Variables (HF_TOKEN)

The Netlify Function needs your Hugging Face token.

- In Netlify UI: Site settings → Environment variables
  - Add key: `HF_TOKEN`
  - Value: your Hugging Face token

CLI alternative once the site is linked:
```bash
netlify env:set HF_TOKEN your_token_here
```

---

## 3) Create Site From Git (Netlify UI)

1. Netlify dashboard → “Add new site” → “Import an existing project”.
2. Choose GitHub and select your repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Functions directory: `netlify/functions`
   - Node version: 18 (already set in `netlify.toml`, but you can also choose it in UI)
4. If your repo root is the parent folder (monorepo style), set **Base directory** to `demo_website_v2` so Netlify runs the build where `package.json` resides.
5. Click “Deploy site”.

Once the build finishes, your site is live at `https://<site-name>.netlify.app`.

---

## 4) Verify After Deploy

- Open `https://<site-name>.netlify.app/` (Home)
- Open `https://<site-name>.netlify.app/demo` (Live Demo)
- Test the chat. If you see an auth error, ensure `HF_TOKEN` is set in the site’s environment and redeploy.
- Function logs: Site → Functions → `chat` → Logs

---

## 5) Deploy via CLI (Alternative)

If you prefer the CLI or want to deploy a local branch quickly:

```bash
# From project root (the one with package.json)
netlify login
netlify init   # or `netlify link` if the site already exists
netlify env:set HF_TOKEN your_token_here
netlify deploy --build --prod
```

This will build (`npm run build`) and deploy the `out` directory along with the serverless functions.

---

## 6) Redirects and SPA Behavior

This project uses static export. For client-side routing to work (e.g., `/demo`), ensure SPA fallback is configured. The provided `netlify.toml` includes:

```toml
[build]
  command = "npm run build"
  publish = "out"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"

[[redirects]]
  from = "/demo"
  to = "/demo/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Tip: Avoid placing a `/* -> /404.html` (404) redirect above the SPA fallback, as it will consume all requests before the fallback. The two redirects shown above are sufficient for this template.

---

## 7) Common Pitfalls

- **Base directory mismatch**: If Netlify can’t find `package.json`, set Base directory to `demo_website_v2` (when your repo root is the parent folder).
- **Missing HF_TOKEN**: The function will return 401/403 or a generic error. Set `HF_TOKEN` and redeploy.
- **Wrong Node version**: Ensure Node 18 is used (via `netlify.toml` or UI settings).
- **Function path**: The chat function lives at `/.netlify/functions/chat` (visible both locally with `netlify dev` and in production).

---

## 8) Updating After Changes

- Commit and push to the tracked branch (e.g., `main`). Netlify will auto-build and deploy.
- For configuration changes (env vars, base dir), trigger a new deploy after saving settings.

---

## 9) Optional: Custom Domain + HTTPS

- In Netlify: Domain management → Add custom domain → follow DNS instructions.
- Netlify will provision HTTPS automatically via Let’s Encrypt.
