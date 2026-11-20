# Chungas World — Attractions

Server-wide attractions with opening hours. Public page: `/attractions`. Staff page: `/admin` (GitHub token login).

## Setup
1. Create a new GitHub repo and upload everything in this folder.
2. Edit `config.js`: set `githubRepo` (and `githubOwner`).
3. Settings → Pages → deploy from `main` / root. Add a custom domain if you like.
4. Put icons in `cw-icons/` named like `the-swan-pub.png`.
5. Open `/admin`, log in with a fine-grained token (this repo only, Contents: read & write).

## Embed on the website
```html
<iframe src="https://YOUR-SITE/attractions?embed=1" style="border:0;width:100%;height:600px"></iframe>
<iframe src="https://YOUR-SITE/attractions?embed=1&id=swan-pub" style="border:0;width:100%;height:140px"></iframe>
```
