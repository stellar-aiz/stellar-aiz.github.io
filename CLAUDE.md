# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Stellar AIz corporate website - a static site deployed to GitHub Pages from `/docs/`. It is plain HTML, one shared CSS file and one small JavaScript file, with no framework and no CDN dependencies except Google Fonts.

## Development

- Files in `/docs/` are served directly by GitHub Pages (custom domain in `docs/CNAME`)
- No `npm install` or build step is needed to edit the site
- Preview locally with a server so directory URLs work: `python -m http.server 3000 --directory docs`

## Architecture

### Directory Structure
- `/docs/index.html` - Top page (Japanese); `/docs/en/` mirrors every page in English
- `/docs/pages/<name>/index.html` - Pages: services, doggies, record (track record), members, news, about (company), inquiry (+ `thanks.html`), privacy
- `/docs/pages/products/...` - Redirect stubs from the previous site's product pages to `/pages/services/`
- `/docs/assets/css/site.css` - All styles (minified)
- `/docs/assets/js/site.js` - Menu, filters, member modal, contact form, hero motion
- `/docs/assets/img/` - Images as WebP + JPEG pairs at fixed widths (`name-<width>.webp/.jpg`)
- `/docs/assets/icons/` - favicon and app icons
- `/docs/404.html`, `sitemap.xml`, `robots.txt`
- `/spec/` - Specifications from the previous site (partly outdated)

### Conventions
- **Links are relative** (`../services/`), so the site also works under a sub-path
- **Language switch**: every Japanese page has an English twin at the same path under `/en/`; keep them in sync and keep the `hreflang` links in `<head>` correct
- **Content Security Policy** is set per page with a `<meta http-equiv>` tag. Scripts and styles must come from files in `/assets/`; do not add inline `<script>` code, inline `style=""` attributes or new third-party hosts without updating the policy on every page. JSON data blocks (`type="application/json"`, `application/ld+json`) are fine
- **Images**: use `<picture>` with WebP `srcset` and a JPEG fallback, plus `width`, `height`, `loading="lazy"` and `decoding="async"`
- **Contact form** posts to Formspree (`https://formspree.io/f/manrvzgw`) with the same field names as before; `_next` points to the thanks page
- **Fonts**: Latin text uses Georgia (Gelasio as fallback), Japanese uses Noto Sans JP
- Accessibility: skip link, visible focus states, `prefers-reduced-motion` respected

## Common Tasks

### Editing text
Edit the page's `index.html` and its `/en/` twin. Update `<meta name="description">` if the page's purpose changes.

### Adding a page
1. Copy an existing page folder under `/docs/pages/` (and `/docs/en/pages/`)
2. Update `<title>`, description, canonical, `hreflang` and `og:url`
3. Add it to the header and footer navigation on every page, and to `sitemap.xml`

### Adding news
Add an `<article class="nitem">` at the top of `/docs/pages/news/index.html` (and the English page), and update the two newest items on the top pages

## Important Notes

- Always test in multiple browsers (Chrome, Safari, Firefox)
- Verify mobile responsiveness for all changes (no horizontal scroll at 375px)
- Check the browser console for Content Security Policy errors after changes
- Keep file sizes minimal for fast loading

## Claude Code Skills

フロントエンド実装時は、可能な限り `frontend-design` スキルを活用すること。

- 新しいページやコンポーネントの作成
- UIデザインの改善・リファクタリング
- レスポンシブデザインの実装

このスキルにより、高品質でプロダクションレベルのコードを生成できる。