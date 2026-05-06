export function parseKeysBulk(raw) {
  if (!raw?.trim()) return [];
  const out = [];
  const seen = new Set();
  for (const line of raw.split(/\r?\n/)) {
    let part = line.trim();
    if (!part || part.startsWith('#')) continue;
    if (part.includes(',')) part = part.split(',')[0].trim();
    else if (part.includes('\t')) part = part.split('\t')[0].trim();
    if (part && !seen.has(part)) {
      seen.add(part);
      out.push(part);
    }
  }
  return out;
}

export const DEFAULT_DESCRIPTION =
  'Licence authentique à vie.\nLivraison instantanée par email.\nGarantie satisfait ou remboursé.\nSupport technique 7j/7.';
