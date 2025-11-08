export function bool(val: string | undefined, fallback = false): boolean {
  if (val === undefined) return fallback;
  const v = val.toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function num(val: string | undefined, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

