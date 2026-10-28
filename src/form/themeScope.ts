import type { FlierDoc } from '@dloizides/poster-render';
import { cloneFlier, splitDoc, type ThemedFlier } from '../theme/flierTheme';
import { ThemeId } from '../theme/ThemeId';
import type { FlierTheme } from '../theme/themes';
import { EditScope } from './EditScope';

function restyle(flier: ThemedFlier, theme: FlierTheme): ThemedFlier {
  const copy = cloneFlier(flier);
  if (copy.themeId === theme.id) return copy;
  const kept = { ...copy.kept, [copy.themeId]: copy.style };
  const style = kept[theme.id] ?? theme.styleFor(copy.content);
  delete kept[theme.id];
  return { themeId: theme.id, content: copy.content, style, kept };
}

/** Puts the selected flier, or with All every flier, on the theme; a switch back restores the old style. */
export function applyTheme(scope: EditScope, fliers: readonly ThemedFlier[], index: number, theme: FlierTheme): ThemedFlier[] {
  return fliers.map((flier, i) => (scope === EditScope.All || i === index ? restyle(flier, theme) : cloneFlier(flier)));
}

/** The fliers after a doc edit; each keeps its theme and remembered styles. */
export function withDocs(fliers: readonly ThemedFlier[], docs: readonly FlierDoc[]): ThemedFlier[] {
  return docs.map((doc, i) => {
    const was = fliers[i] as ThemedFlier | undefined;
    const next: ThemedFlier = { themeId: was?.themeId ?? ThemeId.KizombaClassic, ...splitDoc(doc) };
    if (was?.kept !== undefined) next.kept = JSON.parse(JSON.stringify(was.kept)) as ThemedFlier['kept'];
    return next;
  });
}
