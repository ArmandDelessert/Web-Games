#!/usr/bin/env node
/* Fast, dependency-free checks for the whole repo — no browser required.
 * - Every game-list link on the homepage resolves to a real file.
 * - Every JSON file parses.
 * - Every inline <script> block (no src=) in every .html file is valid JS
 *   (checked in-process via vm.Script — compiles without executing).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
let failures = 0;

function fail(msg) {
    failures++;
    console.error('FAIL: ' + msg);
}

function ok(msg) {
    console.log('ok   ' + msg);
}

/* ── 1. Dead links on the homepage ── */
function checkHomepageLinks() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const hrefs = [...html.matchAll(/class="game-link"\s+href="([^"]+)"/g)].map(m => m[1]);
    if (hrefs.length === 0) {
        fail('index.html: no .game-link hrefs found (parser out of sync with the markup?)');
        return;
    }
    for (const href of hrefs) {
        const target = href.endsWith('/') ? path.join(ROOT, href, 'index.html') : path.join(ROOT, href);
        if (fs.existsSync(target)) {
            ok('link ' + href + ' → ' + path.relative(ROOT, target));
        } else {
            fail('index.html: link "' + href + '" does not resolve to an existing file (' + target + ')');
        }
    }
}

/* ── 2. JSON validity ── */
function checkJsonFiles() {
    const files = ['manifest.json', 'version.json'];
    for (const f of files) {
        const p = path.join(ROOT, f);
        if (!fs.existsSync(p)) { fail(f + ': file not found'); continue; }
        try {
            JSON.parse(fs.readFileSync(p, 'utf8'));
            ok(f + ' is valid JSON');
        } catch (e) {
            fail(f + ': ' + e.message);
        }
    }
}

/* ── 3. Inline <script> syntax (every .html file, skipping node_modules if any) ── */
function findHtmlFiles(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) findHtmlFiles(full, out);
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function checkInlineScripts() {
    const files = findHtmlFiles(ROOT, []);
    const scriptTagRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        let m, count = 0;
        while ((m = scriptTagRe.exec(html))) {
            count++;
            try {
                new vm.Script(m[1], { filename: path.relative(ROOT, file) + '#inline-script-' + count });
            } catch (e) {
                fail(path.relative(ROOT, file) + ': inline <script> #' + count + ' has a syntax error — ' + e.message);
            }
        }
        ok(path.relative(ROOT, file) + ': ' + count + ' inline script(s) checked');
    }
}

checkHomepageLinks();
checkJsonFiles();
checkInlineScripts();

console.log('');
if (failures > 0) {
    console.error(failures + ' check(s) failed.');
    process.exit(1);
} else {
    console.log('All checks passed.');
}
