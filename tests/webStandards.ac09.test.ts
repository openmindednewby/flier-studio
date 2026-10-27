import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const read = (p: string): string => readFileSync(join(root, p), 'utf8');
const HOST = 'https://fliers.dloizides.com/';

describe('index.html', () => {
  it('with the SEO baseline, carries title, description, canonical and Open Graph tags', () => {
    const html = read('index.html');

    const found = ['<title>Flier Studio', 'name="description"', 'rel="canonical" href="' + HOST + '"', 'property="og:title"', 'property="og:image"', 'name="viewport"'].filter((s) => html.includes(s));

    expect(found).toHaveLength(6);
  });

  it('with analytics, loads the Umami script and no mailto in served HTML', () => {
    const html = read('index.html');

    const umami = html.includes('analytics.dloizides.com/script.js');

    expect(umami).toBe(true);
    expect(html).not.toContain('mailto:');
  });
});

describe('robots and sitemap', () => {
  it('with the public files, point at the production host', () => {
    const robots = read('public/robots.txt');

    const sitemap = read('public/sitemap.xml');

    expect(robots).toContain('Sitemap: ' + HOST + 'sitemap.xml');
    expect(sitemap).toContain('<loc>' + HOST + '</loc>');
  });
});

describe('styles', () => {
  it('with interactive controls, sets a 44px minimum hit box and a bounded desktop column', () => {
    const css = read('src/ui/styles.css');

    const hit = /--hit:\s*44px/.test(css) && /min-height:\s*var\(--hit\)/.test(css);

    expect(hit).toBe(true);
    expect(css).toMatch(/max-width:\s*1200px/);
  });

  it('with colours, takes every colour from design-token variables, never a literal', () => {
    const css = read('src/ui/styles.css');

    const literals = css.match(/#[0-9a-f]{3,8}\b|rgb\(/gi) ?? [];

    expect(literals).toEqual([]);
  });
});
