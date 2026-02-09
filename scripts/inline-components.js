#!/usr/bin/env node

/**
 * inline-components.js
 *
 * Reads component HTML files from docs/components/ and injects them
 * into all page HTML files' placeholder divs. This ensures Googlebot
 * can discover navigation links in the static HTML without JavaScript.
 *
 * Usage: node scripts/inline-components.js
 *
 * - Idempotent: safe to run multiple times
 * - Zero npm dependencies (Node.js fs/path only)
 * - Components in docs/components/ remain the Single Source of Truth
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const COMPONENTS_DIR = path.join(DOCS_DIR, 'components');

const COMPONENT_MAP = {
  'header-placeholder': { ja: 'header.html', en: 'header-en.html' },
  'footer-placeholder': { ja: 'footer.html', en: 'footer-en.html' }
};

function readComponent(filename) {
  const filePath = path.join(COMPONENTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Component file not found: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8').trim();
}

function isEnglishPage(filePath) {
  const relative = path.relative(DOCS_DIR, filePath);
  return relative.startsWith('en' + path.sep) || relative.startsWith('en/');
}

function injectComponent(html, placeholderId, componentHtml) {
  const startMarker = `<!-- COMPONENT:${placeholderId}:START -->`;
  const endMarker = `<!-- COMPONENT:${placeholderId}:END -->`;

  // Pattern 1: Replace existing markers (re-run)
  const markerRegex = new RegExp(
    `(<!-- COMPONENT:${placeholderId}:START -->)[\\s\\S]*?(<!-- COMPONENT:${placeholderId}:END -->)`,
    'g'
  );

  if (markerRegex.test(html)) {
    return html.replace(
      markerRegex,
      `${startMarker}\n${componentHtml}\n${endMarker}`
    );
  }

  // Pattern 2: Empty placeholder div (first run)
  // Match <div id="..."></div> or <div id="..."> </div> (with optional whitespace)
  const emptyDivRegex = new RegExp(
    `(<div id="${placeholderId}">)\\s*(</div>)`,
    'g'
  );

  if (emptyDivRegex.test(html)) {
    return html.replace(
      emptyDivRegex,
      `$1\n${startMarker}\n${componentHtml}\n${endMarker}\n$2`
    );
  }

  // Pattern 3: Placeholder div with content but no markers (manual edit scenario)
  // We don't touch these to avoid data loss
  return html;
}

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip the components directory itself
      if (entry.name === 'components') continue;
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

function main() {
  // Load all component files
  const components = {};
  for (const [id, files] of Object.entries(COMPONENT_MAP)) {
    components[id] = {
      ja: readComponent(files.ja),
      en: readComponent(files.en)
    };
  }

  // Find all HTML files
  const htmlFiles = findHtmlFiles(DOCS_DIR);
  let updatedCount = 0;

  for (const filePath of htmlFiles) {
    const original = fs.readFileSync(filePath, 'utf-8');
    let html = original;
    const lang = isEnglishPage(filePath) ? 'en' : 'ja';

    for (const [id, langComponents] of Object.entries(components)) {
      const componentHtml = langComponents[lang];
      if (!componentHtml) continue;

      // Only process files that have this placeholder
      if (!html.includes(`id="${id}"`)) continue;

      html = injectComponent(html, id, componentHtml);
    }

    if (html !== original) {
      fs.writeFileSync(filePath, html, 'utf-8');
      const relative = path.relative(DOCS_DIR, filePath);
      console.log(`Updated: docs/${relative}`);
      updatedCount++;
    }
  }

  console.log(`\nDone. ${updatedCount} file(s) updated.`);
}

main();
