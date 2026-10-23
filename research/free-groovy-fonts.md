# Free groovy fonts for the shop (commercial web use OK)

Method: opened each source and each font's license page (or the license shown on its page), rendered the shortlist at 15px and 30px, and confirmed the Google CSS URLs return 200. No dafont or 1001fonts picks, because they are mostly personal-use only.

## A. Display fonts (headlines, logo)

| Font | Source / license | Weights | Vibe | Load |
|---|---|---|---|---|
| **Fraunces** | Google Fonts, OFL 1.1 | 100-900 (+italic), SOFT 0-100, WONK 0-1, opsz 9-144 | Soft Cooper/Windsor-style serif. At SOFT 100 / WONK 1 it turns buttery and 70s, and it still looks refined. | `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,100,1&display=swap` |
| **Bagel Fat One** | Google Fonts, OFL 1.1 | 400 | Fat, bubbly, candy-like sans. Reads like glass beads. | `https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap` |
| **DynaPuff** | Google Fonts, OFL 1.1 | 400-700, wdth 75-100 | Inflated, balloon-like letters. Cute but legible. | `https://fonts.googleapis.com/css2?family=DynaPuff:wght@400..700&display=swap` |
| **Chubbo** | Fontshare (Indian Type Foundry), ITF Free Font License | 200-700 + italics + 2 variable files | Slab with rounded terminals and lively cursive italics. Soft and friendly. | `https://api.fontshare.com/v2/css?f[]=chubbo@400,700&display=swap`, or self-host |
| **Basteleur** (Bold, Moonlight) | Velvetyne, via Uncut.wtf; SIL OFL 1.1 | 2 styles | "Medieval meets Cooper Black" (the foundry's words). It is chunky, flared, and a bit mystical. | Self-host: download the zip from velvetyne.alwaysdata.net/fonts/basteleur/. Convert to woff2 if the zip has none (OFL allows it). |
| **Pilowlava** (Regular, Atome) | Velvetyne; SIL OFL 1.1 | 2 styles | Liquid, melting, psychedelic letters. Too wild for body copy. Use it for the logo or one hero word only. | Self-host from velvetyne.alwaysdata.net/fonts/pilowlava/ |
| **Coconat** | Collletttivo; SIL OFL | 3 styles | Fat flared serif, 70s-leaning and quirky. | Self-host from collletttivo.it/typefaces/coconat |

Honorable mentions, all OFL on Google:
- Kavoon, Chicle, Oleo Script (retro scripts).
- Gasoek One, Coiny, Rubik Bubbles (blobby and heavy).
- Shrikhand (already your logo).

Fontshare's Britney (bold retro italic) and Zina are also free under the ITF license.

## B. Text fonts (14-17px: prices, buttons, short copy)

| Font | Source / license | Weights | Vibe | Load |
|---|---|---|---|---|
| **Sour Gummy** (current) | Google, OFL 1.1 | 100-900, wdth 100-125 | Soft, gummy, friendly. Readable at 15px at weight 500 or higher. | `family=Sour+Gummy:wght@400..700` |
| **Fredoka** | Google, OFL 1.1 | 300-700, wdth 75-125 | Round, bubbly, very clear. It is the closest to Sour Gummy and the most legible. | `family=Fredoka:wght@400..700` |
| **Nunito** | Google, OFL 1.1 | 200-1000 (+italic) | Rounded-terminal sans. Calm and Apple-polished, so it makes the display font look more groovy. | `family=Nunito:wght@400..800` |
| **Grandstander** | Google, OFL 1.1 | 100-900 (+italic) | Quirky, bouncy lowercase with a 70s-cartoon feel. Fine for short blurbs, a bit busy for long text. | `family=Grandstander:wght@400..800` |
| **Roundo** | Fontshare, SIL OFL (stated on its Fontshare page) | 200-700 + variable | Soft geometric rounded sans. | `https://api.fontshare.com/v2/css?f[]=roundo@400,500,700&display=swap` |

Prefix each Google `family=` with `https://fonts.googleapis.com/css2?` and add `&display=swap` at the end.

## Load notes
- **Fontshare:** the ITF license allows commercial web use and self-hosting. It forbids modifying the files, and its terms list subsetting and format conversion as modification. Self-host the woff2 files exactly as downloaded, or use the API. The API did not return multiple fonts reliably, so use one `<link>` per font.
- **Google Fonts:** all OFL. You can use the CDN or self-host (google-webfonts-helper or fontsource).
- **Velvetyne and Collletttivo:** OFL, self-host only. Velvetyne asks for a credit, for example on the product page, and welcomes donations.

## Rejected
- **PicNic** (Velvetyne): custom "CUTE" license, not OFL.
- **Trille and Aventine** (Uncut): license listed only as "free", with no specific license.
- **Fablab** (Uncut): GPL-3.
- **League of Moveable Type:** all OFL, but nothing groovy beyond Knewave and Sniglet (also on Google).
- **Open Foundry:** nothing groovy. Young Serif and Cooper Hewitt are plain.
- **Font Squirrel:** mostly mirrors of Google, League and Velvetyne fonts.

## Recommended pairings
1. **Fraunces (SOFT 100, WONK 1, weight 600-800) headlines + Nunito (500-600) text.** This is the most polished and "Apple" option. Fraunces gives the groovy curves, Nunito keeps prices and buttons crisp, and one variable file covers each family. Keep Shrikhand as the logo. Swap Nunito for Fredoka if you want it bubblier.
2. **Bagel Fat One or Chubbo headlines + Fredoka text.** This is the playful, candy-bead version. Use Bagel Fat One for loud sections and Chubbo for a calmer, more crafted feel.

## Is Caprasimo + Sour Gummy still good?
Yes. Keep it. Both are OFL, soft, and chunky, so they already read as groovy and cohesive, and they are on Google's CDN. The one risk is that two bubbly voices plus the Shrikhand logo leave little hierarchy. Fixes: set Sour Gummy to weight 500 or higher and wdth 100 below 16px, and add 0.01em letter-spacing. If the UI feels too wobbly, set only prices, buttons and labels in Nunito or Fredoka. Only swap if you want a more refined, less Cooper Black look (pairing 1).

## Sources (opened)
- https://fonts.google.com/specimen/Fraunces/license
- https://fonts.google.com/specimen/Bagel+Fat+One/license
- https://fonts.google.com/specimen/DynaPuff/license
- https://fonts.google.com/specimen/Sour+Gummy/license
- https://fonts.google.com/specimen/Fredoka/license
- https://fonts.google.com/specimen/Nunito/license
- https://fonts.google.com/specimen/Grandstander/license
- https://fonts.google.com/specimen/Caprasimo/license
- https://github.com/google/fonts (METADATA.pb per family, for axes and license directory)
- https://www.fontshare.com/fonts/chubbo (ITF Free Font License text)
- https://www.fontshare.com/fonts/roundo
- https://api.fontshare.com/v2/fonts and https://api.fontshare.com/v2/css (catalog and CSS API)
- https://velvetyne.alwaysdata.net/ , /fonts/pilowlava/ , /fonts/basteleur/ , /fonts/sligoil/ , /fonts/picnic/ , /about/faq/
- https://www.collletttivo.it/typefaces , /typefaces/coconat , /typefaces/mazius-display
- https://www.theleagueofmoveabletype.com/ and /chunk
- https://open-foundry.com/
- https://uncut.wtf/ , /legal/ , /sitemap.xml and individual font pages (honey, milkman, fudd, louise, cambrian, utara, solide, gemini, trille, fablab, aventine and others)
- https://www.fontsquirrel.com/fonts/list/popular , /fonts/list/foundry/velvetyne , /fonts/happy-times-at-the-ikob
