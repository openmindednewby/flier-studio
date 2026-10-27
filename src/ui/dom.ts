import { FM } from '../i18n/fm';

type Props = Record<string, string | undefined>;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, children: (Node | string)[] = []): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

export function button(labelKey: string, testId: string, onClick: () => void, extraClass = ''): HTMLButtonElement {
  const label = FM(labelKey);
  const node = el('button', { type: 'button', class: extraClass, 'data-testid': testId, 'aria-description': FM('hint.button', label), text: label });
  node.addEventListener('click', onClick);
  return node;
}

export function labelled(labelKey: string, control: HTMLElement): HTMLLabelElement {
  control.setAttribute('aria-description', FM('hint.field', FM(labelKey)));
  return el('label', {}, [el('span', { text: FM(labelKey) }), control]);
}

export function fileButton(labelKey: string, testId: string, accept: string, onFile: (file: File) => void): HTMLLabelElement {
  const input = el('input', { type: 'file', accept, class: 'visually-hidden', 'data-testid': testId });
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) onFile(file);
    input.value = '';
  });
  return el('label', { class: 'file', 'aria-description': FM('hint.button', FM(labelKey)) }, [FM(labelKey), input]);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: fileName });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
