export interface Counts {
  plastic: number;
  cans: number;
  glass: number;
}

// Stawki kaucji PL (grosze/szt). Butelka plastikowa i puszka mają tę samą stawkę.
export const DEPOSIT_GROSZE = {
  plastic: 50,
  cans: 50,
  glass: 100,
} as const;

// Średnie objętości opakowań (m3) i powierzchnia sklepu odniesienia.
// ponytail: przybliżenie (~700 m² x 4 m wysokości = ~2800 m3), podmień na zweryfikowane dane.
export const VOLUME_M3 = {
  plastic: 0.0015,
  cans: 0.0004,
  glass: 0.0008,
} as const;

export const BIEDRONKA_M3 = 2800;

const TITLES = [
  { threshold: 0, name: 'Żółtodziób' },
  { threshold: 50, name: 'Zbieracz' },
  { threshold: 200, name: 'Łowca kaucji' },
  { threshold: 1000, name: 'Mistrz recyklingu' },
  { threshold: 5000, name: 'Król Kauciusz' },
] as const;

export function totalItems(counts: Counts): number {
  return counts.plastic + counts.cans + counts.glass;
}

export function valueGrosze(counts: Counts): number {
  return (
    counts.plastic * DEPOSIT_GROSZE.plastic +
    counts.cans * DEPOSIT_GROSZE.cans +
    counts.glass * DEPOSIT_GROSZE.glass
  );
}

export function volumeM3(counts: Counts): number {
  return (
    counts.plastic * VOLUME_M3.plastic +
    counts.cans * VOLUME_M3.cans +
    counts.glass * VOLUME_M3.glass
  );
}

export function biedronkaShare(m3: number): number {
  return m3 / BIEDRONKA_M3;
}

export function titleFor(totalCollected: number): string {
  let current: string = TITLES[0].name;
  for (const tier of TITLES) {
    if (totalCollected >= tier.threshold) current = tier.name;
  }
  return current;
}

export function formatPLN(grosze: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(
    grosze / 100
  );
}
