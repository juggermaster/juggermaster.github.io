# Third-party notices

**JUGGERMASTER**'s own code, documentation and original graphics are MIT-licensed. Third-party components retain their own copyrights and licences. Full texts are in `web/vendor/` and are included in the generated app and its offline cache.

## Browser runtime

The locally bundled Framework7 JavaScript is byte-identical to `framework7-bundle.min.js` from the official npm package `framework7@9.2.0`. Framework7 declares the dependencies below. Version ranges are the publisher's declarations for the prebuilt bundle, not a claim that each dependency has a separately verifiable version marker in the minified file.

| Component | Version / publisher's dependency range | Licence | Source | Included licence |
| --- | --- | --- | --- | --- |
| Framework7 | 9.2.0 | MIT | https://github.com/framework7io/framework7/tree/v9.2.0 | LICENSE-Framework7.txt |
| Dom7 | ^4.0.6 | MIT | https://github.com/nolimits4web/dom7 | LICENSE-dom7.txt |
| htm | ^3.1.1 | Apache-2.0 | https://github.com/developit/htm | LICENSE-htm.txt |
| path-to-regexp | ^6.3.0 | MIT | https://github.com/pillarjs/path-to-regexp | LICENSE-path-to-regexp.txt |
| Skeleton Elements | ^4.0.1 | MIT | https://github.com/nolimits4web/skeleton-elements | LICENSE-skeleton-elements.txt |
| ssr-window | ^5.0.1 | MIT | https://github.com/nolimits4web/ssr-window | LICENSE-ssr-window.txt |
| Swiper | ^12.1.2 | MIT | https://github.com/nolimits4web/swiper | LICENSE-swiper.txt |

The Framework7 CSS has been modified to remove embedded `@font-face` rules and disable embedded SVG message-bubble masks for compatibility with the app's content security policy. The framework's copyright header is preserved. **JUGGERMASTER** loads no external font files. No third-party artwork, team logos or audio samples are bundled; flags and app icons are original geometric drawings, and audio is synthesised in the browser.

The copied licence files preserve their upstream attribution notices. No separate NOTICE file was present in the inspected npm packages. The Skeleton Elements licence comes from its upstream v4.0.1 tag because its npm package omits that file.

## Development tools

Sharp and Playwright are development dependencies with exact versions and integrity data in `package-lock.json`. Their installed packages retain their own licences, including those of native dependencies. They are not shipped as browser scripts. Sharp rasterises the project's SVG icon into PNG files during the build; the generated images are **JUGGERMASTER** artwork.

## Original assets

`web/src/images/icon.svg` and `flag-*.svg` are original project assets covered by the project MIT licence. The app uses fonts already available on the device. National flags are drawn from geometric construction descriptions; third-party image files are not copied into this repository.
