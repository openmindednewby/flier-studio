import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '../../../src');
const files = ['main.ts', ...readdirSync(join(SRC, 'ui')).filter((f) => f.endsWith('.ts') && !f.includes('.test.')).map((f) => `ui/${f}`)];
const lines = files.flatMap((f) => readFileSync(join(SRC, f), 'utf8').split('\n').map((text, i) => ({ at: `src/${f}:${String(i + 1)}`, text })));
const find = (needle) => lines.find((l) => l.text.includes(needle))?.at ?? 'UNKNOWN';
const seen = (shot) => new Set(JSON.parse(readFileSync(join(HERE, 'frames', `before-${shot}.json`), 'utf8')).visibleItems);
const [s360, s1280] = [seen('load-360'), seen('load-1280')];
const STATES = /^(lead|status|prompt-status|selected|list-hint|invalid|render-pending|import-dialog|cutout-dialog|dark|mini-sheet|previews-heading)$/;
const fate = {
  'pick-theme': 'moved to All fliers (C: as theme chips)',
  'pick-theme-scope': 'dropped D11 "AC-18..20 approved" (theme is global only)',
  'theme-row': 'moved to All fliers (container)',
  'pick-scope': 'moved to All fliers',
  'add-flier': 'moved to All fliers',
  'download-all': 'kept (A) / moved to All fliers (B, C)',
  'share-url': 'kept (A, C) / moved to All fliers (B)',
  'config-share': 'kept (A, C) / moved to All fliers (B)',
  'edit-n': 'kept; a click anywhere on the flier also selects (AC-18)',
  'mini-sheet': 'kept; becomes the enlarge view on double-click (A, C)',
};
const one = (id, item, kind, needle) => ({ id, item, kind, needle });
const items = [
  one('brand', 'Flier Studio mark + wordmark, home link', 'link', "'brand'"),
  one('lead', 'Lead line', 'field', 'app.lead'),
  one('status', 'Status line (saved, loaded, copied, imported)', 'badge/status', "'data-testid': 'status'"),
  one('prompt-text', 'Prompt: describe the flier', 'field', "'prompt-text'"),
  one('prompt-generate', 'Generate', 'action', "'prompt-generate'"),
  one('prompt-status', 'Prompt progress / outcome', 'badge/status', "'prompt-status'"),
  one('flier-form', 'Flier card + "Editing flier x of y"', 'field', 'form.editing'),
  one('theme-row', 'Theme row container', 'setting', "'theme-row'"),
  one('pick-theme', 'Theme', 'setting', "'pick-theme'"),
  one('pick-theme-scope', 'Theme applies to (this / all)', 'setting', "'pick-theme-scope'"),
  one('pick-scope', 'Shared text edits apply to (this / all)', 'setting', "'pick-scope'"),
  ...['layout', 'format', 'palette', 'fonts', 'background'].map((p) => one(`pick-${p}`, `Picker: ${p}`, 'setting', 'pick-${p}')),
  one('upload-picture', 'Upload picture', 'action', "'upload-picture'"),
  one('upload-logo', 'Upload logo', 'action', "'upload-logo'"),
  one('remove-background', 'Remove picture background (disabled with no picture)', 'action', "'remove-background'"),
  one('pick-anchor', 'Picture alignment', 'setting', "'pick-anchor'"),
  one('pick-scale', 'Picture size slider', 'setting', "'pick-scale'"),
  one('pick-scale-value', 'Picture size % readout', 'field', "'pick-scale-value'"),
  ...['title', 'titleBottom', 'script', 'includesHeading', 'footer', 'venue', 'schedule', 'prices', 'includesItems', 'items'].map((k) => one(`field-${k}`, `Text: ${k}`, 'field', 'field-${key}')),
  one('add-flier', 'Add flier (copy of the selected one)', 'action', "'add-flier'"),
  one('remove-flier', 'Remove flier (the selected one)', 'action', "'remove-flier'"),
  one('config-name', 'Saved set name', 'field', "'config-name'"),
  one('config-save', 'Save set', 'action', "'config-save'"),
  one('config-pick', 'Saved sets list', 'filter/sort/search/export', "'config-pick'"),
  ...['load', 'rename', 'delete', 'export', 'import'].map((a) => one(`config-${a}`, `Saved set: ${a}`, 'action', `'config-${a}'`)),
  one('share-url', 'Share link field', 'field', "'share-url'"),
  one('config-share', 'Make share link', 'action', "'config-share'"),
  one('config-preset', 'Load Kizomba preset', 'action', "'config-preset'"),
  one('previews', 'Previews section + heading', 'field', 'previews.heading'),
  one('download-all', 'Download all PNGs', 'action', "'download-all'"),
  one('preview-grid', 'Preview grid', 'row', "'preview-grid'"),
  one('preview-n', 'Flier canvas (aria-label = title)', 'row', 'preview-${n}'),
  one('selected', 'Selected flier crop marks', 'badge/status', "'selected'"),
  one('edit-n', 'Edit flier n (selects it)', 'action', 'edit-${n}'),
  one('download-n', 'Download PNG of one flier', 'action', 'download-${n}'),
  one('list-hint', 'List hint state (too many rows)', 'empty/error/loading state', "'list-hint'"),
  one('invalid', 'Flier render error', 'empty/error/loading state', 'form.invalid'),
  one('render-pending', 'Render pending (debounce 150 ms)', 'empty/error/loading state', "'pending'"),
  one('mini-preview', 'Phone bar: live thumbnail', 'row', "'mini-preview'"),
  one('mini-open', 'Phone bar: open full size', 'action', "'mini-open'"),
  one('mini-position', 'Phone bar: "Flier x of y"', 'field', "'mini-position'"),
  one('mini-see-all', 'Phone bar: See all n', 'action', "'mini-see-all'"),
  one('mini-sheet', 'Full-size sheet + Close', 'action', "'mini-sheet'"),
  one('import-dialog', 'Share-link import dialog (import, dismiss, error, dropped notice)', 'action', "'import-dialog'"),
  one('cutout-dialog', 'Background-removal dialog (keep, erase, move, zoom, brush, use, cancel)', 'action', "'cutout-dialog'"),
  one('dark', 'Dark theme (prefers-color-scheme)', 'setting', "dataset.theme = 'dark'"),
];
const tick = (id, set) => (set.has(id) ? 'seen' : id.startsWith('mini-') && set === s1280 ? 'phone-only by design (bar hidden at desktop)' : STATES.test(id) ? 'state (not on first load)' : 'not visible');
const rows = items.map((r, i) => `| ${String(i + 1)} | Visitor | ${r.item} \`${r.id}\` | ${r.kind} | ${find(r.needle)} | ${tick(r.id, s360)} | ${tick(r.id, s1280)} | ${fate[r.id] ?? 'kept'} |`);
const head = [
  '## Information inventory',
  'Old screen: https://fliers.dloizides.com/ → src/main.ts (live 98ca2bc)',
  'Roles: Visitor (no sign-in, one role)',
  'Sighted: Visitor @ https://fliers.dloizides.com/ 2026-10-28, Playwright `Galaxy S5` 360x640 + `Desktop Chrome` 1280x800 (apps/flier-studio/docs/design/FLIER-2-AC18-20/frames/before-*.json)',
  '',
  '| # | Role | Item | Kind | Source | 360 | 1280 | Fate |',
  '|---|---|---|---|---|---|---|---|',
];
writeFileSync(process.argv[2], `${[...head, ...rows].join('\n')}\n`);
console.log(items.length, 'items; UNKNOWN', rows.filter((r) => r.includes('UNKNOWN')).length, '; not visible', rows.filter((r) => r.includes('not visible')).length);
