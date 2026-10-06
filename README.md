# HatheemOS 98: portfolio

A Windows 98–style portfolio desktop. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Folder layout

```
index.html            ← page skeleton (loads the CSS and JS below)
css/style.css         ← all styling (Win98 chrome, pages, games)
js/content.js         ← ★ YOUR CONTENT (edited by the Control Panel, or by hand as JSON)
admin/                ← the Control Panel: a web editor for content.js, at /admin/
js/app.js             ← window manager, pages, games, wallpaper, audio
audio/calm-shore.mp3  ← background beach sound
images/               ← your photo, project covers, screenshots
certs/                ← certificate images
cv.pdf                ← (add this) your CV
tools/make_beach.py   ← script that generated the beach sound (optional, needs numpy + scipy + ffmpeg)
```

## Run it locally

Open `index.html` in a browser. For audio, the CV viewer and images to behave exactly like the live site, serve the folder instead:

```bash
cd hatheem-portfolio
python -m http.server 8000
# then open http://localhost:8000
```

## Control Panel (the easy way)

Open **`/admin`** on your site (your domain followed by `/admin`).
Edit things, press **Publish**, and the site updates about a minute later. It works from a phone too.

It saves straight to GitHub through the API as a normal commit on the default branch, so Vercel
redeploys exactly as if you had pushed. There's nothing to run and nothing to `git push`.
The repository it edits is set at the top of `admin/admin.js` (`REPO`).
After publishing from the panel, run `git pull` on your laptop before you edit files there.

It edits everything on the site: **Projects** (cover, screenshots, GitHub link), **Journal**,
**Certificates**, **Milestones**, **Competitions**, **Profile** (photo, facts, ticker), **CV & Contact**
(upload a new CV) and **Wallpaper & Sound** (greeting, boat phrases, badges, volume).

- **Preview** shows the real site with your unpublished changes, opened on the window you're editing.
- **File → History** lists every publish; **Load** brings an older version back (with its pictures) to check and republish.

**One-time setup: a token.** The panel needs a GitHub token that can change this one repository:

1. Open https://github.com/settings/personal-access-tokens/new (fine-grained token).
2. Name it "Control Panel" and pick an expiry. When it expires, make a new one.
3. Repository access → **Only select repositories** → this repository.
4. Permissions → **Contents: Read and write**.
5. Generate, copy, and paste it into the panel's log-on box.

The token is stored only in your browser. Use **File → Sign out** to remove it. Only tick
"Remember me" on your own devices. If a token ever leaks, delete it on that same GitHub page.

What the panel does for you:
- Resizes pictures, converts big ones to WebP, and names and files them for you:
  `certs/intro-to-mcp-scrimba.webp`, `images/projects/<project>/screenshot-name.webp`, `images/journal/<story>/photo.webp`, `images/me.webp`.
- Turns a PDF certificate into an image (page 1).
- Saves all your changes as one commit, with a readable message.
- Replaces `cv.pdf` when you upload a new CV, and fills in the "updated" month.
- Deletes picture files that nothing uses any more (you can untick this when publishing).
- Stops you if `content.js` was changed somewhere else since you opened it, so nothing is overwritten.

## Updating content by hand

Everything lives in `const CONTENT = { ... }` in `js/content.js`. It's written as JSON so the
Control Panel can read it: double quotes, no comments, no trailing commas. (Hand-written JS
still loads, but the panel rewrites it as JSON on its next publish.)

| What | Where in CONTENT | Notes |
|---|---|---|
| Your photo for me.bmp | `"photo": "images/me.jpg"` | `""` = pixel avatar |
| CV | `cv: { file: "cv.pdf", updated: "Oct 2026" }` | put `cv.pdf` next to `index.html` |
| LinkedIn / email | `contact.linkedin`, `contact.email` | both are placeholders now |
| New project | copy one object in `projects` | give it a unique `id`; cover is picked automatically, or set `thumb` / `cover` |
| Project screenshots | `images: [{ src: "images/x.png", caption: "..." }]` | `src: ""` shows a placeholder |
| Journal story | copy one object in `journal` | unique `id`, paragraphs in `body` |
| Certificate | add to `certificates` (or use the Control Panel) | `image: "certs/name.png"`, shown uncropped |
| Competition | add to `competitions` (or use the Control Panel) | `place` 1–3 puts a trophy on the shelf |
| Background sound | `music: { src, title, volume }` | volume 0–1; visitors can only mute |
| Wallpaper greeting | `welcome` | `null` removes it |
| Boat phrases | `boatSays` | |

Tip: if you replace `audio/calm-shore.mp3` with a new file of the same name, bump the `?v=` number in `music.src` so browsers don't keep the old one.
