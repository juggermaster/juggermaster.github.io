# JUGGERMASTER

[Open the app](https://juggermaster.github.io/) · [Source](https://github.com/juggermaster/juggermaster.github.io) · [MIT licence](LICENSE)

Jugger match timing and scoring in a mobile web app. Open the website online once and wait for the offline-file message to disappear. The browser caches the complete app automatically. Reopen the same address offline afterwards; no separate download or installation is required. A home-screen shortcut is optional.

## Features

- Sets by default, plus two halves, three periods, Golden Jugg and continuous beats.
- Configurable stones, interval, teams, colours, countdown and up/down counting.
- Editable team fields with saved-team selection, local colours and removal. Separate setup and sound defaults.
- Synthesised stone-on-metal, gong and drum sounds, with drum as the default. Separate beat and Jugg/period-end volume and optional volume levelling for each; one to ten overlapping end beats.
- Continuous sound preview, local match state and 30 undo steps. Reopening always restores a paused match.
- 23 languages, automatic browser-language selection, saved manual choice and original SVG flags. Hebrew uses right-to-left text.
- Responsive layout, always-visible bottom tabs, manual header full-screen button, foreground screen wake lock, home-screen instructions in Info, offline help, legal pages and licence notices.

## Development

Node.js 22 or newer:

```sh
npm ci
npm test
npm run build
npm start
```

Open http://localhost:4173/. Offline features need HTTPS or localhost; opening the HTML file directly is insufficient. On Windows use `npm.cmd` if PowerShell blocks npm scripts.

```sh
npx playwright install chromium webkit
npm run test:browser
npm run build
npm run test:webkit
npm run check:source
npm run check:build
```

`CHROME_PATH` optionally selects a local Chromium executable. Otherwise Playwright uses its installed browser. The browser suite builds test versions; build again afterwards for publication. Generated output is in `dist/` and is not committed.

`web/src/images/icon.svg` is the only editable app-icon source. The build generates 180, 192 and 512 pixel PNG compatibility icons automatically. Do not maintain PNG copies in the sources.

## Publishing

GitHub Actions checks the sources, runs automated tests, builds the app and publishes only `dist/` from `main`. Pull requests are checked without publishing. Select **GitHub Actions** in the repository's Pages settings, leave the custom domain empty and use HTTPS. No own server credentials or manually embedded tokens are needed.

Before pushing: finish local changes and checks, commit locally, inspect the actual commit and all outgoing history, then push only the checked revision. `node web/scripts/check.mjs history HEAD` checks committed file versions for private files and known secret patterns. It supplements review; it does not detect every possible credential.

For a new release, set `JUGGER_RELEASE` to a fresh release identifier (default `v25`). For rollback, restore working sources in a new commit and release with a fresh identifier. Repeat checks and commit review before pushing. Updates wait for acceptance while playback is stopped and retain local match state. Old caches are cleared only with one current app window open.

## Browser and storage limits

Use a current browser. Automated Chromium and WebKit tests include mobile and desktop layouts; emulation does not replace tests on real phones. Before a match, check volume, speaker/Bluetooth latency and interruption behaviour on the actual device. Keep the app visible. Browsers may refuse wake lock or full screen, and playback while locked or in the background is not guaranteed. New versions are accepted only when playback is stopped.

Match state and settings remain in this browser. Clearing site data or browser storage eviction removes matches and offline files; there is no server backup. On a new origin the app starts with defaults. No login, synchronisation, advertising or analytics is built into the app. GitHub Pages handles hosting connection data as explained in the privacy page.

## Contributions

Use [Issues](https://github.com/juggermaster/juggermaster.github.io/issues) for reproducible bugs and translation corrections. Include browser, OS, language, app version and steps, without private data. Small pull requests are welcome. Submit only work you may license under MIT; original contributions are accepted under the project MIT licence. Existing third-party notices must remain intact. Changes are reviewed and checked before publication. Report security vulnerabilities privately using the contact address in the app's legal notice; never include credentials or private data in public reports.

## Licence and assets

The project's own code, documentation and original graphics are under the [MIT licence](LICENSE). Commercial use, modification and redistribution are allowed provided copyright and licence notices remain. The licence includes warranty and liability disclaimers.

Third-party code retains its own licences. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `web/vendor/LICENSE-*.txt`, all included in the offline build. Flags and canine-skull artwork are original geometric drawings. Sounds are synthesised; no external artwork, fonts or audio files are loaded.

`private: true` in `package.json` prevents accidental npm publishing. It does not make the GitHub repository or website private.
