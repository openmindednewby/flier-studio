import { createFormatMessage } from '@dloizides/i18n/core';
import en from './en.json';

/** Looks up a UI string by dotted key; {{p1}}, {{p2}} take the params in order. */
export const FM = createFormatMessage(en);
