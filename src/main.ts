import { DEFAULT_CSS_VAR_NAMES, FLIER_TOKENS, toCssVars } from '@dloizides/design-tokens';
import { PictureAnchor, type FlierDoc } from '@dloizides/poster-render';
import { cutPicture, cutoutFile, lazy } from './cutout/cutoutFlow';
import { EditScope } from './form/EditScope';
import { nextDocs } from './form/sharedFields';
import { applyTheme, withDocs } from './form/themeScope';
import { FM } from './i18n/fm';
import { kizombaPreset } from './presets/kizomba';
import { importShared } from './share/importShared';
import { decodeShare, shareFragmentOf } from './share/shareCodec';
import { ConfigStore } from './store/configStore';
import { ImageStore } from './store/imageStore';
import { FlierStore } from './store/flierStore';
import { cloneFlier, toDoc, toThemed } from './theme/flierTheme';
import { themeById } from './theme/themes';
import { AssetBook } from './ui/assets';
import { renderConfigPanel } from './ui/configPanel';
import { button, el } from './ui/dom';
import { createMiniPreview } from './ui/miniPreview';
import { focusTitle, renderForm } from './ui/formView';
import { openImportDialog } from './ui/importDialog';
import { downloadCanvas, renderPreviews } from './ui/previews';
import { renderPromptPanel } from './ui/promptPanel';
import { UploadKind } from './ui/UploadKind';
import './ui/styles.css';

const RENDER_DELAY_MS = 150;
const DOWNLOAD_GAP_MS = 300;
const DESKTOP_MIN = 1024;

const working = new FlierStore();
const state = { fliers: working.load() ?? kizombaPreset().map((d) => toThemed(d)), selected: 0, scope: EditScope.This, themeScope: EditScope.This, canvases: [] as HTMLCanvasElement[] };
const docsOf = (): FlierDoc[] => state.fliers.map(toDoc);
const assets = new AssetBook(new ImageStore());
const configs = new ConfigStore();

document.head.append(el('style', { text: toCssVars(FLIER_TOKENS, DEFAULT_CSS_VAR_NAMES) }));
if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';

const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'status' });
const formBox = el('section', { class: 'card', 'data-testid': 'flier-form' });
const previewGrid = el('div', { class: 'preview-grid', 'data-testid': 'preview-grid' });
const configBox = el('section', { class: 'card' });
const promptBox = el('section', { class: 'card' });
const mini = createMiniPreview({ seeAll: () => previewGrid.closest('section')?.scrollIntoView({ block: 'start' }) });

let timer: number | undefined;
function refreshPreviews(): void {
  working.save(state.fliers);
  const docs = docsOf();
  window.clearTimeout(timer);
  previewGrid.dataset.render = 'pending';
  timer = window.setTimeout(async () => {
    const book = await assets.forDocs(docs);
    state.canvases = await renderPreviews(previewGrid, docs, book, { selected: state.selected, select });
    mini.update(state.canvases[state.selected], state.selected, docs.length);
    previewGrid.dataset.render = 'done';
  }, RENDER_DELAY_MS);
}

function showForm(): void {
  const docs = docsOf();
  renderForm(formBox, docs[state.selected], [state.selected + 1, docs.length], {
    change: (doc) => { const reshaped = doc.format !== docs[state.selected].format; state.fliers = withDocs(state.fliers, nextDocs(state.scope, docsOf(), state.selected, doc)); if (reshaped) showForm(); refreshPreviews(); },
    upload: (kind, file) => void upload(kind, file),
    removeBackground: () => void removeBackground(),
    scope: () => state.scope,
    setScope: (scope) => { state.scope = scope; },
    theme: () => state.fliers[state.selected].themeId,
    setTheme: (id) => setTheme(id),
    themeScope: () => state.themeScope,
    setThemeScope: (scope) => { state.themeScope = scope; },
    add: () => { state.fliers.push(cloneFlier(state.fliers[state.selected])); select(state.fliers.length - 1); },
    remove: () => { if (state.fliers.length > 1) { state.fliers.splice(state.selected, 1); select(Math.max(0, state.selected - 1)); } },
  });
}

async function upload(kind: UploadKind, file: File): Promise<void> {
  const id = await assets.upload(file, kind);
  const docs = docsOf();
  const doc = docs[state.selected];
  if (kind === UploadKind.Logo) doc.logo = { imageId: id };
  else doc.picture = { anchor: doc.picture?.anchor ?? PictureAnchor.Bottom, scale: doc.picture?.scale ?? 1, imageId: id };
  state.fliers = withDocs(state.fliers, docs);
  showForm();
  refreshPreviews();
}

const remover = lazy(async () => (await import('@dloizides/background-removal')).createBackgroundRemover(__BG_REMOVAL_URLS__));

async function removeBackground(): Promise<void> {
  const { openCutoutDialog } = await import('./ui/cutoutDialog');
  const imageId = docsOf()[state.selected].picture?.imageId;
  openCutoutDialog({ cut: () => cutPicture(imageId, { sourceOf: (id) => assets.sourceOf(id), remover }), use: (png) => void upload(UploadKind.Picture, cutoutFile(png)) });
}

function select(index: number): void {
  state.selected = index;
  showForm();
  refreshPreviews();
}

function setTheme(id: string): void {
  const theme = themeById(id);
  if (theme === undefined) return;
  state.fliers = applyTheme(state.themeScope, state.fliers, state.selected, theme);
  showForm();
  refreshPreviews();
}

function apply(docs: FlierDoc[], themes?: readonly string[] | null): void {
  state.fliers = docs.map((d, i) => toThemed(d, themeById(themes?.[i] ?? '')?.id));
  select(0);
}

function renderConfigs(): void {
  renderConfigPanel(configBox, configs, { current: docsOf, currentThemes: () => state.fliers.map((f) => f.themeId), apply, status: (m) => { status.textContent = m; } });
}

async function checkShare(): Promise<void> {
  const fragment = shareFragmentOf(location.hash);
  if (fragment === null) return;
  const decoded = await decodeShare(fragment);
  openImportDialog(decoded, {
    accept: (docs, themes) => { const names = importShared(configs, docs, themes); renderConfigs(); status.textContent = FM('share.imported', String(names.length)); },
    closed: () => history.replaceState(null, '', location.pathname + location.search),
  });
}

async function downloadAll(): Promise<void> {
  const docs = docsOf();
  for (const [i, canvas] of state.canvases.entries()) {
    await downloadCanvas(canvas, docs[i], i);
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
    mini.bar,
  );
  renderPromptPanel(promptBox, (doc) => apply([doc]));
  renderConfigs();
  select(0);
  if (window.innerWidth >= DESKTOP_MIN) focusTitle(formBox);
  window.addEventListener('hashchange', () => void checkShare());
  await checkShare();
}

void start();
