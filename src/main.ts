import { DEFAULT_CSS_VAR_NAMES, KATALOGOS_TOKENS, toCssVars } from '@dloizides/design-tokens';
import { PictureAnchor, type FlierDoc } from '@dloizides/poster-render';
import { FM } from './i18n/fm';
import { kizombaPreset } from './presets/kizomba';
import { ConfigStore } from './store/configStore';
import { ImageStore } from './store/imageStore';
import { WorkingDocStore } from './store/workingDocStore';
import { AssetBook } from './ui/assets';
import { renderConfigPanel } from './ui/configPanel';
import { button, el } from './ui/dom';
import { focusTitle, renderForm } from './ui/formView';
import { downloadCanvas, renderPreviews } from './ui/previews';
import { renderPromptPanel } from './ui/promptPanel';
import { UploadKind } from './ui/UploadKind';
import './ui/styles.css';

const RENDER_DELAY_MS = 150;
const DOWNLOAD_GAP_MS = 300;
const DESKTOP_MIN = 1024;

const working = new WorkingDocStore();
const state = { docs: working.load() ?? kizombaPreset(), selected: 0, canvases: [] as HTMLCanvasElement[] };
const assets = new AssetBook(new ImageStore());
const configs = new ConfigStore();

document.head.append(el('style', { text: toCssVars(KATALOGOS_TOKENS, DEFAULT_CSS_VAR_NAMES) }));
if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';

const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'status' });
const formBox = el('section', { class: 'card', 'data-testid': 'flier-form' });
const previewGrid = el('div', { class: 'preview-grid' });
const configBox = el('section', { class: 'card' });
const promptBox = el('section', { class: 'card' });

let timer: number | undefined;
function refreshPreviews(): void {
  working.save(state.docs);
  window.clearTimeout(timer);
  timer = window.setTimeout(async () => {
    const book = await assets.forDocs(state.docs);
    state.canvases = await renderPreviews(previewGrid, state.docs, book, { selected: state.selected, select });
  }, RENDER_DELAY_MS);
}

function showForm(): void {
  renderForm(formBox, state.docs[state.selected], [state.selected + 1, state.docs.length], {
    change: (doc) => { const reshaped = doc.format !== state.docs[state.selected].format; state.docs[state.selected] = doc; if (reshaped) showForm(); refreshPreviews(); },
    upload: (kind, file) => void upload(kind, file),
    add: () => { state.docs.push(JSON.parse(JSON.stringify(state.docs[state.selected])) as FlierDoc); select(state.docs.length - 1); },
    remove: () => { if (state.docs.length > 1) { state.docs.splice(state.selected, 1); select(Math.max(0, state.selected - 1)); } },
  });
}

async function upload(kind: UploadKind, file: File): Promise<void> {
  const id = await assets.upload(file, kind);
  const doc = state.docs[state.selected];
  if (kind === UploadKind.Logo) doc.logo = { imageId: id };
  else doc.picture = { anchor: doc.picture?.anchor ?? PictureAnchor.Bottom, scale: doc.picture?.scale ?? 1, imageId: id };
  showForm();
  refreshPreviews();
}

function select(index: number): void {
  state.selected = index;
  showForm();
  refreshPreviews();
}

function apply(docs: FlierDoc[]): void {
  state.docs = docs;
  select(0);
}

async function downloadAll(): Promise<void> {
  for (const [i, canvas] of state.canvases.entries()) {
    await downloadCanvas(canvas, state.docs[i], i);
    await new Promise((r) => setTimeout(r, DOWNLOAD_GAP_MS));
  }
}

async function start(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  if (new URLSearchParams(location.search).get('measure') === 'llm') {
    const out = el('pre', { 'data-testid': 'measure' });
    app.replaceChildren(out);
    await (await import('./ui/measurePage')).runModelMeasure(out);
    return;
  }
  const previews = el('section', { class: 'previews', 'data-testid': 'previews' }, [
    el('div', { class: 'row head' }, [el('h2', { text: FM('previews.heading') }), button('previews.downloadAll', 'download-all', () => void downloadAll(), 'primary')]),
    previewGrid,
  ]);
  app.replaceChildren(
    el('header', {}, [el('h1', { text: FM('app.title') }), el('p', { class: 'lead', text: FM('app.lead') }), status]),
    el('main', {}, [el('div', { class: 'controls' }, [promptBox, formBox, configBox]), previews]),
  );
  renderPromptPanel(promptBox, (doc) => apply([doc]));
  renderConfigPanel(configBox, configs, { current: () => state.docs, apply, status: (m) => { status.textContent = m; } });
  select(0);
  if (window.innerWidth >= DESKTOP_MIN) focusTitle(formBox);
}

void start();
