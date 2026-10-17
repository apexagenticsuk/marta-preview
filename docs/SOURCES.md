# Image sources

Every picture on this preview is Marta's own, downloaded from the public media of https://www.kidsshow.ie (static.wixstatic.com). Nothing was bought, generated or taken from elsewhere.

`docs/source/sources.json` maps each site asset to its Wix media file; `docs/source/post-images.json` maps each post image (`post_NN` = post number) to its Wix media file. `tools/images.py` makes the sized WebP files in `assets/` from those originals (900px wide for photos plus a 480px copy, 240px for logos, 700px and 420px for post pictures).

`assets/og.jpg` (the share image) is made from `hero_marta.webp` and the site name.

YouTube thumbnails (`assets/yt_*.webp`) are the public thumbnails of Marta's own videos, saved once so the page makes no request to YouTube until a visitor presses play.

## Fonts

Fredoka (500, 700) and Nunito (400, 700), both SIL Open Font License 1.1, self-hosted as subset WOFF2 in `assets/font_*.woff2`. The licence allows free use and embedding; the fonts are not sold on their own.
