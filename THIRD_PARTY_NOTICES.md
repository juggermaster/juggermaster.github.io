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

The Framework7 CSS has been modified to remove embedded `@font-face` rules and disable embedded SVG message-bubble masks for compatibility with the app's content security policy. The framework's copyright header is preserved. **JUGGERMASTER** loads no external font files. Flags and app icons are original geometric drawings. Audio synthesis and the instrument recordings described below are bundled locally.

The copied licence files preserve their upstream attribution notices. No separate NOTICE file was present in the inspected npm packages. The Skeleton Elements licence comes from its upstream v4.0.1 tag because its npm package omits that file.

## Instrument synthesis and recordings

| Component | Version | Licence | Source | Included licence |
| --- | --- | --- | --- | --- |
| SpessaSynth core | 4.3.22 | Apache-2.0 | https://github.com/spessasus/spessasynth_core | LICENSE-SpessaSynth.txt |
| stb-vorbis JavaScript/Wasm wrapper | 0.0.6 | Apache-2.0 | https://github.com/spessasus/stb-vorbis | LICENSE-stb-vorbis.txt |
| stb_vorbis C decoder | included by stb-vorbis | MIT / public domain | https://github.com/nothings/stb | LICENSE-stb.txt |
| GeneralUser GS | 2.0.3 | GeneralUser GS License v2.0 | https://github.com/mrbumpy409/GeneralUser-GS/tree/684543d5e5efaef08d02be50dcda8d552478fa60 | LICENSE-GeneralUser-GS.txt |
| Versilian Community Sample Library (VCSL) | source revision c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e | CC0-1.0 | https://github.com/sgossner/VCSL/tree/c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e | LICENSE-VCSL.txt |

SpessaSynth is by Spessasus. `spessasynth-core.mjs` is copied from the pinned npm package's `dist/index.js`, with only its stb-vorbis import changed to the local filename and its source-map link removed. `stb-vorbis.mjs` is copied unchanged from its pinned package. Those packages contain no separate NOTICE file. The decoder retains the original stb public-domain/MIT licensing.

`percussion.sf2` is a modified subset of GeneralUser GS by S. Christian Collins, with VCSL gong recordings added. The original GeneralUser GS SHA-256 is `9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe`. The subset retains the offered pitched percussion instruments and all 61 standard GM/GS percussion keys (27–87), each at velocity 110. GeneralUser GS permits software-project use and modification under its included licence; that licence also describes the provenance limitations of its inherited samples. It is not relicensed under this project's MIT licence.

The two gongs use `Idiophones/Struck Idiophones/Gong 1/gong_f.wav` and `gong_2_f.wav` from VCSL (Versilian Studios and contributors). They are mixed to mono, resampled to 22050 Hz and limited to the first 12 seconds, then embedded in the SoundFont as presets 112 and 113 in bank 127, separate from GeneralUser’s bell and agogo presets. `web/test/fixtures/gong.mp3` contains only the first 16384 bytes of VCSL's `Idiophones/Struck Idiophones/Gong 2/hit_light1.mp3`, used to verify actual MP3 decoding. All three source recordings are covered by the included CC0 dedication.

The browser renders each selected instrument with SpessaSynth and schedules its buffered strikes using the existing Web Audio clock. The General MIDI sequencer and physical Web MIDI device interface are not needed. Both the engine and bank are cached for offline use. Files selected by a user are stored locally and are not part of this distribution.

## Development tools

Sharp and Playwright are development dependencies with exact versions and integrity data in `package-lock.json`. Their installed packages retain their own licences, including those of native dependencies. They are not shipped as browser scripts. Sharp rasterises the project's SVG icon into PNG files during the build; the generated images are **JUGGERMASTER** artwork.

## Original assets

`web/src/images/icon.svg` and `flag-*.svg` are original project assets covered by the project MIT licence. The app uses fonts already available on the device. National flags are drawn from geometric construction descriptions; third-party image files are not copied into this repository.
