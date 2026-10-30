# Birthday Webpage

[Simplified Chinese](README.zh.md)

A candle, a little stardust, and a letter worth keeping.

![Animated desktop preview: a rotating galaxy cake, drifting stars, and birthday wishes written stroke by stroke](docs/images/desktop-home.gif)

![Animated desktop scroll: the cake moves left as the letter unfolds on the right and its words gradually appear](docs/images/desktop-letter.gif)

Birthday Webpage is a deployment-ready birthday experience, pairing a slowly turning celestial cake with handwritten greetings and a letter revealed on scroll—all against a pure black backdrop. Share it as a complete celebration, or let it serve as a template for something personal: every greeting and letter can be rewritten, with the layout and animations adapting to the new content.

## A birthday, beautifully told

- **A little universe around a candle.** Galaxy glaze, gold leaf, sugar crystals, pearl borders, and layered cream decorations meet drifting stars and softly glowing trails. The entire scene is drawn live in the browser.
- **Words that come to life.** The greeting and signature appear stroke by stroke. Scroll further to reveal textured stationery and a letter that arrives one paragraph at a time.
- **A layout for every screen.** On desktop, the cake moves to the left as the letter opens alongside it. On mobile, the letter follows the birthday scene in its own space, with comfortable margins for reading.
- **One more little wish.** Click or tap the candle to release a burst of starlight.

The page respects reduced-motion preferences and pauses continuous animation when the scene is out of view or the tab is hidden.

## Open it in seconds

1. Download or clone this repository.
2. Open `index.html` in a modern desktop browser.
3. Enjoy the scene, then scroll to read the letter.

No installation, build step, or internet connection is needed for local viewing. HTML, CSS, JavaScript, and the bundled handwriting data are all it takes.

## Make it personal

All greeting and letter text can be changed in [content.js](content.js). Replace the names, add a wish, or write a completely new letter. Handwriting paths, text sizing, and paragraph reveal animations adapt to the updated content automatically—there are no animation keyframes to rework.

| Setting | What it changes |
| --- | --- |
| `recipient`, `sender` | The recipient's name and the signature |
| `greeting`, `punctuation`, `fromLabel` | The main greeting and signature introduction |
| `extraWishes` | Additional messages beneath the greeting |
| `letterSalutation` | The letter's opening line |
| `letterParagraphs` | The letter body; each entry becomes a paragraph |
| `letterClosing` | The closing line above the signature |
| `animation` | Cake rotation speed, handwriting duration, and star count |

Use `{recipient}` and `{sender}` in letter text to reuse the configured names. Save the file and refresh the page to see the result.

The bundled stroke font animates supported characters, including English letters. Other scripts, such as Chinese, appear as regular text while keeping the responsive layout and paragraph reveal effects.

## Share the celebration

Publish `index.html`, `content.js`, `assets/`, `licenses/`, `LICENSE`, `NOTICE`, and `VERSION` to a static hosting service, preserving their relative paths. There is no server-side application or build command to configure. Share the resulting link for desktop and mobile visitors alike.

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

This project is freely shared for personal and noncommercial use. You may use, modify, and redistribute it for noncommercial purposes, subject to the license terms. Redistributions must include the license and [copyright notice](NOTICE).

**Commercial use is not permitted.** This includes, but is not limited to, selling the project or modified versions, offering paid customization or setup services, and monetizing the project through advertisements or paid hosting.

No commercial licenses are offered.

Please respect the original intention of this project: **to spread joy and happiness, not to generate profit.**

*This summary is for convenience only; the full text in the `LICENSE` file governs.*

## Credits

The cake and starfield are rendered with Canvas; the handwriting uses SVG stroke paths from EMS Allure, derived from Allura. Font attribution and the SIL Open Font License are included in [licenses/EMS-Allure.txt](licenses/EMS-Allure.txt).
