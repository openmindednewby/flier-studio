import en from './en.json';

type Tree = { [key: string]: string | Tree };

/** Looks up a UI string by dotted key; {{p1}}, {{p2}} take the params in order. */
export function FM(key: string, ...params: string[]): string {
  const found = key.split('.').reduce<string | Tree | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), en as Tree);
  const text = typeof found === 'string' ? found : key;
  return params.reduce((out, p, i) => out.split(`{{p${String(i + 1)}}}`).join(p), text);
}
