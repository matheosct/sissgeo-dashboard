import { useState, useMemo } from 'react';
import { Colaborador } from '@/lib/colaboradorUtils';
import { Registro } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  colaboradores: Colaborador[];
  registros: Registro[];
}

export function ColaboradoresTable({ colaboradores, registros }: Props) {
  const [tipo, setTipo] = useState<'colaborador' | 'especialista'>('colaborador');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);

  // Count registros per state for correlation info
  const registrosPorEstado = useMemo(() => {
    const counts: Record<string, number> = {};
    registros.forEach(r => {
      counts[r.state] = (counts[r.state] || 0) + 1;
    });
    return counts;
  }, [registros]);

  const estados = useMemo(() => {
    const set = new Set(colaboradores.map(c => c.estado).filter(Boolean));
    return Array.from(set).sort();
  }, [colaboradores]);

  const filtered = useMemo(() => {
    let list = colaboradores.filter(c => c.tipo === tipo);
    if (estadoFilter !== 'all') {
      list = list.filter(c => c.estado === estadoFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(s) ||
        c.cidade.toLowerCase().includes(s) ||
        c.profissao.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s)
      );
    }
    return list;
  }, [colaboradores, tipo, estadoFilter, search]);

  const visible = filtered.slice(0, visibleCount);

  const totalColab = colaboradores.filter(c => c.tipo === 'colaborador').length;
  const totalEsp = colaboradores.filter(c => c.tipo === 'especialista').length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Colaboradores</p>
              <p className="text-2xl font-bold">{totalColab.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Especialistas</p>
              <p className="text-2xl font-bold">{totalEsp.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estados</p>
              <p className="text-2xl font-bold">{estados.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{registros.length.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle className="text-lg">Colaboradores e Especialistas</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setVisibleCount(20); }}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={estadoFilter} onValueChange={v => { setEstadoFilter(v); setVisibleCount(20); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos UFs</SelectItem>
                  {estados.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tipo} onValueChange={v => { setTipo(v as any); setVisibleCount(20); }}>
            <TabsList>
              <TabsTrigger value="colaborador" className="gap-2">
                <Users className="h-4 w-4" />
                Colaboradores ({totalColab.toLocaleString('pt-BR')})
              </TabsTrigger>
              <TabsTrigger value="especialista" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Especialistas ({totalEsp.toLocaleString('pt-BR')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colaborador">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Profissão</TableHead>
                      <TableHead>Escolaridade</TableHead>
                      <TableHead>Gênero</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Órgão</TableHead>
                      <TableHead>Registros (UF)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nome}</TableCell>
                        <TableCell>{c.profissao || '—'}</TableCell>
                        <TableCell>{c.escolaridade || '—'}</TableCell>
                        <TableCell>{c.genero || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{c.estado}</Badge></TableCell>
                        <TableCell>{c.cidade}</TableCell>
                        <TableCell>{c.orgao || '—'}</TableCell>
                        <TableCell className="text-center">
                          {(registrosPorEstado[c.estado] || 0).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {visibleCount < filtered.length && (
                  <div className="flex justify-center py-3">
                    <Button variant="outline" size="sm" onClick={() => setVisibleCount(v => v + 20)}>
                      Visualizar mais ({filtered.length - visibleCount} restantes)
                    </Button>
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo {Math.min(visibleCount, filtered.length)} de {filtered.length.toLocaleString('pt-BR')} colaboradores
              </p>
            </TabsContent>

            <TabsContent value="especialista">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Área de Conhecimento</TableHead>
                      <TableHead>Profissão</TableHead>
                      <TableHead>Escolaridade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Registros (UF)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nome}</TableCell>
                        <TableCell><Badge>{c.especialidade}</Badge></TableCell>
                        <TableCell>{c.areaConhecimento || '—'}</TableCell>
                        <TableCell>{c.profissao || '—'}</TableCell>
                        <TableCell>{c.escolaridade || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{c.estado}</Badge></TableCell>
                        <TableCell>{c.cidade}</TableCell>
                        <TableCell className="text-center">
                          {(registrosPorEstado[c.estado] || 0).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {visibleCount < filtered.length && (
                  <div className="flex justify-center py-3">
                    <Button variant="outline" size="sm" onClick={() => setVisibleCount(v => v + 20)}>
                      Visualizar mais ({filtered.length - visibleCount} restantes)
                    </Button>
                  </div>
                )}
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
