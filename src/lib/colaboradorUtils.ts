export interface Colaborador {
  id: string;
  nome: string;
  orgao: string;
  dataNascimento: string;
  genero: string;
  escolaridade: string;
  profissao: string;
  email: string;
  estado: string;
  cidade: string;
  especialidade: string;
  areaConhecimento: string;
  tipo: 'colaborador' | 'especialista';
}

export function parseColaboradoresCSV(text: string): Colaborador[] {
  const lines = text.split('\n').filter(l => l.trim());
  const records: Colaborador[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map(s => s.replace(/"/g, '').trim());
    if (parts.length >= 17) {
      const especialidade = parts[15] || '';
      records.push({
        id: parts[0],
        nome: parts[1],
        orgao: parts[2],
        dataNascimento: parts[3]?.split(' ')[0] || '',
        genero: parts[4],
        escolaridade: parts[5],
        profissao: parts[6],
        email: parts[7],
        estado: parts[8],
        cidade: parts[9],
        especialidade,
        areaConhecimento: parts[16] !== 'Nenhum Selecionado' ? parts[16] : '',
        tipo: especialidade ? 'especialista' : 'colaborador',
      });
    }
  }
  return records;
}

export async function loadColaboradores(): Promise<Colaborador[]> {
  const res = await fetch('/data/colaboradores.csv');
  const buffer = await res.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const text = decoder.decode(buffer);
  return parseColaboradoresCSV(text);
}
