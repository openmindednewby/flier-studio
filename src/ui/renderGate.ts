/** Hands out render tickets; a ticket stays current only until the next one is handed out. */
export function renderGate(): () => () => boolean {
  let latest = 0;
  return () => {
    latest += 1;
    const mine = latest;
    return () => mine === latest;
  };
}
