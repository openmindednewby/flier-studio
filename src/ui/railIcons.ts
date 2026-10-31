const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = '20';

const PATHS: Readonly<Record<string, string>> = {
  all: '<rect x="8" y="3" width="12" height="15" rx="1.5"/><path d="M4 7v12.5A1.5 1.5 0 0 0 5.5 21H16"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  drafts: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
  templates: '<rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M4 9h16M10 9v11.5"/>',
  ai: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M12 8.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/><path d="M9 2.5V5M15 2.5V5M9 19v2.5M15 19v2.5M2.5 9H5M2.5 15H5M19 9h2.5M19 15h2.5"/>',
  previews: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  configs: '<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>',
  fold: '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
};

/** A 20 px line icon for a sidebar item, drawn in the text colour and hidden from screen readers. */
export function railIcon(key: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const attrs: Record<string, string> = { class: 'rail-icon', viewBox: '0 0 24 24', width: SIZE, height: SIZE, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
  for (const [name, value] of Object.entries(attrs)) svg.setAttribute(name, value);
  svg.innerHTML = PATHS[key] ?? '';
  return svg;
}
