import { useState, useMemo, useCallback } from 'react';
import { Colaborador } from '@/lib/colaboradorUtils';
import { Registro } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, Search, MapPin, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegionalCard } from '@/components/RegionalCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  colaboradores: Colaborador[];
  registros: Registro[];
}

type SortDir = 'asc' | 'desc' | null;

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || !dir) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  return dir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
}

// Column filter component
function ColumnFilter({ values, selected, onChange }: { values: string[]; selected: Set<string>; onChange: (s: Set<string>) => void }) {
  const allSelected = selected.size === values.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1" onClick={e => e.stopPropagation()}>
          <Filter className={`h-3 w-3 ${selected.size < values.length ? 'text-primary' : 'opacity-40'}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 max-h-64 overflow-auto p-2" align="start" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <Checkbox checked={allSelected} onCheckedChange={() => {
            onChange(allSelected ? new Set() : new Set(values));
          }} />
          <span className="text-xs font-medium">{allSelected ? 'Desmarcar todos' : 'Selecionar todos'}</span>
        </div>
        {values.map(v => (
          <label key={v} className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
            <Checkbox checked={selected.has(v)} onCheckedChange={() => {
              const next = new Set(selected);
              next.has(v) ? next.delete(v) : next.add(v);
              onChange(next);
            }} />
            <span className="truncate">{v || '—'}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

const COL_WIDTHS: Record<string, string> = {
  nome: 'w-[180px] min-w-[180px]',
  profissao: 'w-[140px] min-w-[140px]',
  escolaridade: 'w-[130px] min-w-[130px]',
  genero: 'w-[90px] min-w-[90px]',
  estado: 'w-[80px] min-w-[80px]',
  cidade: 'w-[140px] min-w-[140px]',
  especialidade: 'w-[150px] min-w-[150px]',
  areaConhecimento: 'w-[160px] min-w-[160px]',
  registros: 'w-[110px] min-w-[110px]',
};

export function ColaboradoresTable({ colaboradores, registros }: Props) {
  const [tipo, setTipo] = useState<'colaborador' | 'especialista'>('colaborador');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // Column filters state
  const [colFilters, setColFilters] = useState<Record<string, Set<string>>>({});

  const registrosPorEstado = useMemo(() => {
    const counts: Record<string, number> = {};
    registros.forEach(r => { counts[r.state] = (counts[r.state] || 0) + 1; });
    return counts;
  }, [registros]);

  const estados = useMemo(() => {
    const set = new Set(colaboradores.map(c => c.estado).filter(Boolean));
    return Array.from(set).sort();
  }, [colaboradores]);

  // Get unique values for filterable columns
  const uniqueValues = useMemo(() => {
    const vals: Record<string, Set<string>> = {};
    const filterableCols = ['profissao', 'escolaridade', 'genero', 'estado', 'cidade', 'especialidade', 'areaConhecimento'];
    filterableCols.forEach(col => vals[col] = new Set());
    colaboradores.filter(c => c.tipo === tipo).forEach(c => {
      filterableCols.forEach(col => {
        const v = (c as any)[col] || '';
        if (v) vals[col].add(v);
      });
    });
    const result: Record<string, string[]> = {};
    filterableCols.forEach(col => { result[col] = Array.from(vals[col]).sort(); });
    return result;
  }, [colaboradores, tipo]);

  const updateFilter = useCallback((col: string, selected: Set<string>) => {
    setColFilters(prev => ({ ...prev, [col]: selected }));
    setVisibleCount(20);
  }, []);

  const toggleSort = () => {
    setSortDir(prev => {
      if (!prev) return 'asc';
      if (prev === 'asc') return 'desc';
      return null;
    });
  };

  const filtered = useMemo(() => {
    let list = colaboradores.filter(c => c.tipo === tipo);
    if (estadoFilter !== 'all') list = list.filter(c => c.estado === estadoFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(s) || c.cidade.toLowerCase().includes(s) ||
        c.profissao.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)
      );
    }
    // Apply column filters
    Object.entries(colFilters).forEach(([col, selected]) => {
      if (selected.size > 0 && uniqueValues[col] && selected.size < uniqueValues[col].length) {
        list = list.filter(c => selected.has((c as any)[col] || ''));
      }
    });
    // Sort by registros only
    if (sortDir) {
      list = [...list].sort((a, b) => {
        const va = registrosPorEstado[a.estado] || 0;
        const vb = registrosPorEstado[b.estado] || 0;
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
    return list;
  }, [colaboradores, tipo, estadoFilter, search, sortDir, registrosPorEstado, colFilters, uniqueValues]);

  const visible = filtered.slice(0, visibleCount);
  const totalColab = colaboradores.filter(c => c.tipo === 'colaborador').length;
  const totalEsp = colaboradores.filter(c => c.tipo === 'especialista').length;

  const colabColumns = [
    { key: 'nome', label: 'Nome', filterable: false },
    { key: 'profissao', label: 'Profissão', filterable: true },
    { key: 'escolaridade', label: 'Escolaridade', filterable: true },
    { key: 'genero', label: 'Gênero', filterable: true },
    { key: 'estado', label: 'Estado', filterable: true },
    { key: 'cidade', label: 'Cidade', filterable: true },
    { key: 'registros', label: 'Registros (UF)', filterable: false, sortable: true },
  ];

  const espColumns = [
    { key: 'nome', label: 'Nome', filterable: false },
    { key: 'especialidade', label: 'Especialidade', filterable: true },
    { key: 'areaConhecimento', label: 'Área de Conhecimento', filterable: true },
    { key: 'profissao', label: 'Profissão', filterable: true },
    { key: 'escolaridade', label: 'Escolaridade', filterable: true },
    { key: 'estado', label: 'Estado', filterable: true },
    { key: 'cidade', label: 'Cidade', filterable: true },
    { key: 'registros', label: 'Registros (UF)', filterable: false, sortable: true },
  ];

  const renderHeader = (columns: typeof colabColumns) => (
    <TableHeader>
      <TableRow>
        {columns.map(col => (
          <TableHead key={col.key} className={`${COL_WIDTHS[col.key] || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
            onClick={col.sortable ? toggleSort : undefined}>
            <div className="flex items-center">
              {col.label}
              {col.sortable && <SortIcon active dir={sortDir} />}
              {col.filterable && uniqueValues[col.key] && (
                <ColumnFilter
                  values={uniqueValues[col.key]}
                  selected={colFilters[col.key] || new Set(uniqueValues[col.key])}
                  onChange={s => updateFilter(col.key, s)}
                />
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  const renderColabRow = (c: Colaborador) => (
    <TableRow key={c.id}>
      <TableCell className={`font-medium ${COL_WIDTHS.nome}`}>{c.nome}</TableCell>
      <TableCell className={COL_WIDTHS.profissao}>{c.profissao || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.escolaridade}>{c.escolaridade || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.genero}>{c.genero || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.estado}><Badge variant="outline">{c.estado}</Badge></TableCell>
      <TableCell className={COL_WIDTHS.cidade}>{c.cidade}</TableCell>
      <TableCell className={`text-center ${COL_WIDTHS.registros}`}>{(registrosPorEstado[c.estado] || 0).toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );

  const renderEspRow = (c: Colaborador) => (
    <TableRow key={c.id}>
      <TableCell className={`font-medium ${COL_WIDTHS.nome}`}>{c.nome}</TableCell>
      <TableCell className={COL_WIDTHS.especialidade}><Badge>{c.especialidade}</Badge></TableCell>
      <TableCell className={COL_WIDTHS.areaConhecimento}>{c.areaConhecimento || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.profissao}>{c.profissao || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.escolaridade}>{c.escolaridade || '—'}</TableCell>
      <TableCell className={COL_WIDTHS.estado}><Badge variant="outline">{c.estado}</Badge></TableCell>
      <TableCell className={COL_WIDTHS.cidade}>{c.cidade}</TableCell>
      <TableCell className={`text-center ${COL_WIDTHS.registros}`}>{(registrosPorEstado[c.estado] || 0).toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );

  const renderLoadMore = () =>
    visibleCount < filtered.length ? (
      <div className="flex justify-center py-3">
        <Button variant="outline" size="sm" onClick={() => setVisibleCount(v => v + 20)}>
          Visualizar mais ({filtered.length - visibleCount} restantes)
        </Button>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-1 grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Colaboradores</p>
                <p className="text-4xl font-bold">{totalColab.toLocaleString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Especialistas</p>
                <p className="text-4xl font-bold">{totalEsp.toLocaleString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Estados</p>
                <p className="text-4xl font-bold">{estados.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <RegionalCard colaboradores={colaboradores} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle className="text-lg">Colaboradores e Especialistas</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search}
                  onChange={e => { setSearch(e.target.value); setVisibleCount(20); }}
                  className="pl-9 w-[200px]" />
              </div>
              <Select value={estadoFilter} onValueChange={v => { setEstadoFilter(v); setVisibleCount(20); }}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos UFs</SelectItem>
                  {estados.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tipo} onValueChange={v => { setTipo(v as any); setVisibleCount(20); setSortDir(null); setColFilters({}); }}>
            <TabsList>
              <TabsTrigger value="colaborador" className="gap-2">
                <Users className="h-4 w-4" />Colaboradores ({totalColab.toLocaleString('pt-BR')})
              </TabsTrigger>
              <TabsTrigger value="especialista" className="gap-2">
                <GraduationCap className="h-4 w-4" />Especialistas ({totalEsp.toLocaleString('pt-BR')})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="colaborador">
              <ScrollArea className="h-[500px]">
                <Table>
                  {renderHeader(colabColumns)}
                  <TableBody>{visible.map(renderColabRow)}</TableBody>
                </Table>
                {renderLoadMore()}
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo {Math.min(visibleCount, filtered.length)} de {filtered.length.toLocaleString('pt-BR')} colaboradores
              </p>
            </TabsContent>
            <TabsContent value="especialista">
              <ScrollArea className="h-[500px]">
                <Table>
                  {renderHeader(espColumns)}
                  <TableBody>{visible.map(renderEspRow)}</TableBody>
                </Table>
                {renderLoadMore()}
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo {Math.min(visibleCount, filtered.length)} de {filtered.length.toLocaleString('pt-BR')} especialistas
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
