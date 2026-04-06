export interface Registro {
  id: string;
  animalType: string;
  observationDate: string;
  state: string;
  city: string;
  inclusionDate: string;
}

export async function loadCSV(): Promise<Registro[]> {
  const res = await fetch('/data/registros.csv');
  const buffer = await res.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const text = decoder.decode(buffer);
  
  const lines = text.split('\n').filter(l => l.trim());
  const records: Registro[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map(s => s.replace(/"/g, '').trim());
    if (parts.length >= 6) {
      records.push({
        id: parts[0],
        animalType: parts[1],
        observationDate: parts[2],
        state: parts[3],
        city: parts[4],
        inclusionDate: parts[5],
      });
    }
  }
  return records;
}

export function getTopN<T>(items: T[], key: (item: T) => string, n: number): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const k = key(item);
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export function filterByTimeRange(records: Registro[], range: string): Registro[] {
  if (range === 'all') return records;
  const now = new Date('2026-04-06T23:59:59');
  const ms: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };
  const cutoff = new Date(now.getTime() - ms[range]);
  return records.filter(r => new Date(r.inclusionDate) >= cutoff);
}

export function filterByState(records: Registro[], state: string): Registro[] {
  if (state === 'all') return records;
  return records.filter(r => r.state === state);
}

export function getTimeSeriesData(records: Registro[], range: string) {
  const sorted = [...records].sort((a, b) => 
    new Date(a.inclusionDate).getTime() - new Date(b.inclusionDate).getTime()
  );
  
  if (sorted.length === 0) return [];

  const groupByDay = range === '24h';
  const groups: Record<string, number> = {};
  
  sorted.forEach(r => {
    const d = new Date(r.inclusionDate);
    const key = groupByDay 
      ? `${d.getHours().toString().padStart(2,'0')}:00`
      : `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    groups[key] = (groups[key] || 0) + 1;
  });

  return Object.entries(groups).map(([date, count]) => ({ date, count }));
}

export const BRAZILIAN_STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO'
];

export const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
  SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins'
};
