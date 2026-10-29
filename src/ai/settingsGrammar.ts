import { SETTING_CHOICES, TEXT_KEYS } from './aiSettings';

const TEXT_MAX = 32;

const quoted = (id: string): string => `"\\"${id}\\""`;

/** GBNF grammar for the AC-41 settings object: fixed key order, enum values only, short texts. */
export function settingsGrammar(): string {
  const keys = [...Object.keys(SETTING_CHOICES), ...TEXT_KEYS];
  const fields = keys.map((key) => `"\\"${key}\\":" ${key}`).join(' "," ');
  return [
    `root ::= "{" ${fields} "}"`,
    ...Object.entries(SETTING_CHOICES).map(([key, ids]) => `${key} ::= ${ids.map(quoted).join(' | ')}`),
    ...TEXT_KEYS.map((key) => `${key} ::= text`),
    `text ::= "\\"" [^"\\\\\\n]{0,${TEXT_MAX}} "\\""`,
  ].join('\n');
}
