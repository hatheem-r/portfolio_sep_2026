# HatheemOS 98: portfolio

A Windows 98–style portfolio desktop. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Folder layout

```
index.html            ← page skeleton (loads the CSS and JS below)
css/style.css         ← all styling (Win98 chrome, pages, games)
js/content.js         ← ★ YOUR CONTENT: the only file you normally edit
js/app.js             ← window manager, pages, games, wallpaper, audio
audio/calm-shore.mp3  ← background beach sound
images/               ← your photo, project covers, screenshots
certs/                ← certificate images
cv.pdf                ← (add this) your CV
tools/make_beach.py   ← script that generated the beach sound (optional, needs numpy + scipy + ffmpeg)
.nojekyll             ← tells GitHub Pages to serve files as-is
```

## Run it locally

Open `index.html` in a browser. For audio, the CV viewer and images to behave exactly like the live site, serve the folder instead:

```bash
cd hatheem-portfolio
python -m http.server 8000
# then open http://localhost:8000
```

## Updating content

Everything lives in `const CONTENT = { ... }` in `js/content.js`.

| What | Where in CONTENT | Notes |
|---|---|---|
| Your photo for me.bmp | `photo: "images/me.jpg"` | `""` = pixel avatar |
| CV | `cv: { file: "cv.pdf", updated: "Oct 2026" }` | put `cv.pdf` next to `index.html` |
| LinkedIn / email | `contact.linkedin`, `contact.email` | both are placeholders now |
| New project | copy one object in `projects` | give it a unique `id`; cover is picked automatically, or set `thumb` / `cover` |
| Project screenshots | `images: [{ src: "images/x.png", caption: "..." }]` | `src: ""` shows a placeholder |
| Journal story | copy one object in `journal` | unique `id`, paragraphs in `body` |
| Certificate | add to `certificates` | `image: "certs/name.png"`, shown uncropped |
| Competition | add to `competitions` | `place` 1–3 puts a trophy on the shelf |
| Background sound | `music: { src, title, volume }` | volume 0–1; visitors can only mute |
| Wallpaper greeting | `welcome` | `null` removes it |
| Boat phrases | `boatSays` | |

Still placeholders to fill in: email, LinkedIn, CV, certificates, MARGENT / RAGMAIL / aPOINT details, the workshop journal entry, and the SinTOX draft story.

Tip: if you replace `audio/calm-shore.mp3` with a new file of the same name, bump the `?v=` number in `music.src` so browsers don't keep the old one.
