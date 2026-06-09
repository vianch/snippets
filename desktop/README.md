# Snippets Desktop

A thin [Electron](https://www.electronjs.org/) shell that wraps the deployed
Snippets web app (`https://snippets.vianch.com`) in a native window.

It does **not** bundle the Next.js server. It loads the live site, so every
feature (middleware auth, the `/api/ai` proxy that hides provider keys, MFA)
works exactly as on the web, and the app content auto-updates on every Vercel
deploy. Login (email/password + TOTP) persists across restarts via Electron's
default persistent cookie store.

## Develop

```bash
cd desktop
yarn install          # downloads Electron (~100 MB+) on first run

yarn start            # compile + open the window against the live site
yarn dev              # same, but points at http://localhost:3000 (run `yarn dev` in the repo root first)
```

`SNIPPETS_DESKTOP_URL` overrides the target URL (used by `yarn dev`).

## Package installers

```bash
yarn dist:mac         # .dmg + .zip  → release/
yarn dist:win         # NSIS installer
yarn dist:linux       # AppImage + .deb
```

Output lands in `desktop/release/` (gitignored).

## Layout

| Path                   | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `src/main.ts`          | Main process: window, security, external-link + offline handling |
| `src/preload.ts`       | Exposes `window.snippetsDesktop` (read-only desktop flag)        |
| `offline.html`         | Local fallback shown when the network is unreachable             |
| `electron-builder.yml` | Packaging config (`appId: com.vianch.snippets`)                  |
| `resources/icon.png`   | Source icon; electron-builder derives `.icns`/`.ico` from it     |
| `dist/`                | Compiled JS (gitignored)                                         |

## Troubleshooting

**`Electron failed to install correctly` on `yarn start`** — the npm `electron`
postinstall sometimes extracts an incomplete binary (no `path.txt` / missing
`Frameworks`). Clean reinstall first:

```bash
rm -rf node_modules/electron && yarn install
```

If it still fails, fetch the matching release directly (macOS):

```bash
VER=$(node -p "require('./node_modules/electron/package.json').version")
ARCH=$(node -p "process.arch")   # arm64 or x64
rm -rf node_modules/electron/dist
curl -sSL -o /tmp/electron.zip \
  "https://github.com/electron/electron/releases/download/v${VER}/electron-v${VER}-darwin-${ARCH}.zip"
unzip -q -o /tmp/electron.zip -d node_modules/electron/dist
printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt
node_modules/.bin/electron --version   # should print v${VER}
```

## Not included (v1)

- **Code signing / notarization.** Builds are unsigned. macOS shows a Gatekeeper
  warning on first open (right-click → Open, or
  `xattr -dr com.apple.quarantine "Snippets.app"`); Windows shows SmartScreen.
  Add an Apple Developer cert + Windows EV cert (or use ToDesktop) before
  distributing to other people.
- **Shell auto-update.** Not needed for the wrapper — the web content already
  auto-updates. Add `electron-updater` later if the shell itself must update OTA.
- **Offline data.** The app requires a network connection to Supabase.
