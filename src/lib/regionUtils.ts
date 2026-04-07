export const STATE_TO_REGION: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
};

export const REGION_ORDER = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

export const REGION_COLORS: Record<string, string> = {
  'Norte': 'hsl(var(--chart-1))',
  'Nordeste': 'hsl(var(--chart-2))',
  'Centro-Oeste': 'hsl(var(--chart-3))',
  'Sudeste': 'hsl(var(--chart-4))',
  'Sul': 'hsl(var(--chart-5))',
};
