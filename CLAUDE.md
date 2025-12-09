# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Stellar AIz corporate website - a static site deployed to GitHub Pages. The site is built with vanilla HTML, CSS, and JavaScript, using Tailwind CSS via CDN for styling.

## Development

Since this is a static site with no build process:
- Files in `/docs/` are served directly by GitHub Pages
- No `npm install` or build commands needed
- Edit HTML/CSS/JS files directly
- Changes are live after git push to main branch

To develop locally:
- Open `/docs/index.html` in a browser
- Use a local server (e.g., `python -m http.server 3000` in `/docs/`) for proper relative path handling

## Architecture

### Directory Structure
- `/docs/` - Website files (GitHub Pages root)
  - `/assets/css/` - Custom CSS files (common.css contains design system)
  - `/assets/js/` - JavaScript files (scroll-animations.js, tailwind-config.js)
  - `/assets/images/` - Image assets organized by type
- `/spec/` - Detailed component and page specifications in Markdown

### Technology Stack
- **HTML5** with semantic markup and Japanese language support
- **Tailwind CSS** (CDN v3.x) - Primary styling framework
- **Vanilla JavaScript** - No frameworks, uses modern APIs like Intersection Observer
- **Custom CSS** - Design system extensions in common.css

### Design System

Custom Stellar AIz design tokens built on Tailwind:

**Custom Classes:**
- `.btn-primary-stellar`, `.btn-secondary-stellar`, `.btn-accent-stellar` - Button variants
- `.section-title-stellar`, `.section-subtitle-stellar` - Typography
- `.card-stellar` - Card component
- `.scroll-fade-*`, `.scroll-stagger-*` - Scroll animations

**Color Extensions:**
- stellar-primary: #0066FF
- stellar-accent: #00D9FF
- stellar-dark: #1a202c

**Animation System:**
- Scroll-triggered animations using Intersection Observer
- CSS transitions for hover states
- Respects prefers-reduced-motion

### Key Implementation Patterns

1. **Mobile-First Responsive Design**
   - Use Tailwind's responsive prefixes (md:, lg:)
   - Test all changes on mobile viewports

2. **Japanese Content**
   - Site is primarily in Japanese
   - Use appropriate fonts and line-height for readability

3. **Performance**
   - Minimize external dependencies
   - Use CDN for libraries
   - Optimize images before adding

4. **Accessibility**
   - Semantic HTML structure
   - ARIA labels for interactive elements
   - Keyboard navigation support

## Common Tasks

### Adding a New Page
1. Create HTML file in `/docs/`
2. Copy header/footer structure from index.html
3. Follow existing naming conventions for assets
4. Update navigation links in all pages

### Modifying Animations
- Scroll animations: Edit `/docs/assets/js/scroll-animations.js`
- CSS animations: Edit animation keyframes in `/docs/assets/css/common.css`
- Add animation classes to HTML elements as needed

### Updating the Design System
- Global styles: `/docs/assets/css/common.css`
- Tailwind config: `/docs/assets/js/tailwind-config.js`
- Maintain consistency with existing patterns

## Important Notes

- Always test in multiple browsers (Chrome, Safari, Firefox)
- Verify mobile responsiveness for all changes
- Images should be optimized for web (prefer WebP/JPEG)
- Keep file sizes minimal for fast loading
- Follow established code style and formatting

## Claude Code Skills

フロントエンド実装時は、可能な限り `frontend-design` スキルを活用すること。

- 新しいページやコンポーネントの作成
- UIデザインの改善・リファクタリング
- レスポンシブデザインの実装

このスキルにより、高品質でプロダクションレベルのコードを生成できる。