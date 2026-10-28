import { validateFlierDoc, type FlierDoc } from '@dloizides/poster-render';
import { ShareError } from './ShareError';
import { KIZOMBA_ASSET_URLS, cloneDocs } from '../presets/kizomba';

export const SHARE_VERSION = 1;
export const SHARE_PARAM = 'share';
export const MAX_LINK_CHARS = 16000;
export const MAX_PAYLOAD_BYTES = 262144;
export const MAX_FLIERS = 24;
const FORMAT = 'deflate-raw';
const B64_BLOCK = 4;

export interface ShareEncoded {
  fragment: string;
  dropped: number;
}

export type ShareDecoded = { ok: true; docs: FlierDoc[]; dropped: number } | { ok: false; error: ShareError };

const isBuiltIn = (id: string | undefined): boolean => id === undefined || KIZOMBA_ASSET_URLS[id] !== undefined;

/** Removes picture and logo slots that point at uploaded images and counts them. */
export function stripUploads(docs: readonly FlierDoc[]): { docs: FlierDoc[]; dropped: number } {
  let dropped = 0;
  const out = cloneDocs(docs).map((doc) => {
    if (!isBuiltIn(doc.picture?.imageId)) { delete doc.picture; dropped++; }
    if (!isBuiltIn(doc.logo?.imageId)) { delete doc.logo; dropped++; }
    return doc;
  });
  return { docs: out, dropped };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / B64_BLOCK) * B64_BLOCK, '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, limit: number): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  writer.write(new Uint8Array(bytes)).catch(() => undefined);
  writer.close().catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (let next = await reader.read(); !next.done; next = await reader.read()) {
    total += next.value.length;
    if (total > limit) { await reader.cancel(); throw new RangeError('payload too large'); }
    chunks.push(next.value);
  }
  const out = new Uint8Array(total);
  chunks.reduce((at, c) => { out.set(c, at); return at + c.length; }, 0);
  return out;
}

/** Compresses any JSON value into a base64url fragment payload. */
export async function packPayload(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return toBase64Url(await pipe(bytes, new CompressionStream(FORMAT), Number.MAX_SAFE_INTEGER));
}

/** Encodes the flier set for a share link; uploaded images are left out and counted. */
export async function encodeShare(docs: readonly FlierDoc[]): Promise<ShareEncoded> {
  const stripped = stripUploads(docs);
  const fragment = await packPayload({ v: SHARE_VERSION, dropped: stripped.dropped, docs: stripped.docs });
  return { fragment, dropped: stripped.dropped };
}

export function shareFragmentOf(hash: string): string | null {
  const prefix = `#${SHARE_PARAM}=`;
  return hash.startsWith(prefix) ? hash.slice(prefix.length) : null;
}

function validDoc(d: unknown): boolean {
  return validateFlierDoc(d).ok && isBuiltIn((d as FlierDoc).picture?.imageId) && isBuiltIn((d as FlierDoc).logo?.imageId);
}

function checkPayload(raw: unknown): ShareDecoded {
  const p = raw as { v?: unknown; dropped?: unknown; docs?: unknown } | null;
  if (p === null || typeof p !== 'object') return { ok: false, error: ShareError.NotFlier };
  if (p.v !== SHARE_VERSION) return { ok: false, error: ShareError.Version };
  const docs = p.docs;
  const sized = Array.isArray(docs) && docs.length > 0 && docs.length <= MAX_FLIERS;
  const counted = typeof p.dropped === 'number' && Number.isInteger(p.dropped) && p.dropped >= 0;
  if (!sized || !counted || !(docs as unknown[]).every(validDoc)) return { ok: false, error: ShareError.NotFlier };
  return { ok: true, docs: cloneDocs(docs as FlierDoc[]), dropped: p.dropped as number };
}

/** Decodes a share fragment; anything oversized, tampered, old or off-schema is refused whole. */
export async function decodeShare(fragment: string): Promise<ShareDecoded> {
  if (fragment.length > MAX_LINK_CHARS) return { ok: false, error: ShareError.TooLong };
  let text: string;
  try {
    const bytes = await pipe(fromBase64Url(fragment), new DecompressionStream(FORMAT), MAX_PAYLOAD_BYTES);
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (e) {
    return { ok: false, error: e instanceof RangeError ? ShareError.TooLong : ShareError.Corrupt };
  }
  try {
    return checkPayload(JSON.parse(text));
  } catch {
    return { ok: false, error: ShareError.Corrupt };
  }
}

export function templateName(doc: FlierDoc): string {
  return [doc.blocks.title, doc.blocks.script ?? ''].map((s) => s.trim()).filter((s) => s !== '').join(' - ');
}
