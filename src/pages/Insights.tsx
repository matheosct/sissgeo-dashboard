import { useMemo } from 'react';
import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Leaf, GraduationCap, Clock, Users, TrendingUp, Map, Flame } from 'lucide-react';
import { STATE_TO_REGION, REGION_ORDER, REGION_COLORS } from '@/lib/regionUtils';
import { Registro } from '@/lib/dataUtils';
import { Colaborador } from '@/lib/colaboradorUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/InfoTooltip';

/* ── helpers ── */
function calcShannon(records: Registro[]): number {
  const counts: Record<string, number> = {};
  records.forEach(r => { counts[r.animalType] = (counts[r.animalType] || 0) + 1; });
  const total = records.length;
  if (total === 0) return 0;
  let h = 0;
  Object.values(counts).forEach(n => {
    const p = n / total;
    if (p > 0) h -= p * Math.log(p);
  });
  return h;
}

function ageFromDate(dob: string): number {
  if (!dob) return 0;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 0;
  const now = new Date('2026-04-08');
  return Math.floor((now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

/* ── 1. Species Diversity by Region ── */
function SpeciesDiversityCard({ registros }: { registros: Registro[] }) {
  const data = useMemo(() => {
    const speciesByRegion: Record<string, Set<string>> = {};
    const countByRegion: Record<string, number> = {};
    REGION_ORDER.forEach(r => { speciesByRegion[r] = new Set(); countByRegion[r] = 0; });
    registros.forEach(r => {
      const region = STATE_TO_REGION[r.state];
      if (region) { speciesByRegion[region].add(r.animalType); countByRegion[region]++; }
    });
    return REGION_ORDER.map(region => ({
      region, especies: speciesByRegion[region].size, registros: countByRegion[region],
      shannonIndex: calcShannon(registros.filter(r => STATE_TO_REGION[r.state] === region)),
    }));
  }, [registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Diversidade de Espécies por Região</CardTitle><InfoTooltip text="Índice Shannon-Wiener: H = −Σ(pᵢ × ln(pᵢ)), onde pᵢ é a proporção de cada espécie na região. Valores maiores indicam maior diversidade. Espécies únicas = contagem de tipos distintos de animais registrados." /></div>
        <p className="text-sm text-muted-foreground">Espécies únicas, registros e índice Shannon-Wiener.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="region" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="especies" name="Espécies únicas" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="registros" name="Total registros" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div>
            <h4 className="text-sm font-medium mb-3">Índice de Diversidade (Shannon-Wiener)</h4>
            <div className="space-y-3">
              {data.map(d => {
                const pct = Math.min((d.shannonIndex / 3.5) * 100, 100);
                return (
                  <div key={d.region}>
                    <div className="flex justify-between text-sm"><span>{d.region}</span><span className="text-muted-foreground font-mono">{d.shannonIndex.toFixed(3)}</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: REGION_COLORS[d.region] }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 2. Education vs Quality ── */
function EducationQualityCard({ colaboradores, registros }: { colaboradores: Colaborador[]; registros: Registro[] }) {
  const data = useMemo(() => {
    const byEdu: Record<string, { count: number; estados: Set<string> }> = {};
    colaboradores.forEach(c => {
      const edu = c.escolaridade || 'Não informado';
      if (!byEdu[edu]) byEdu[edu] = { count: 0, estados: new Set() };
      byEdu[edu].count++;
      byEdu[edu].estados.add(c.estado);
    });
    const regPerState: Record<string, number> = {};
    const fieldsPerState: Record<string, { total: number; complete: number }> = {};
    registros.forEach(r => {
      regPerState[r.state] = (regPerState[r.state] || 0) + 1;
      if (!fieldsPerState[r.state]) fieldsPerState[r.state] = { total: 0, complete: 0 };
      fieldsPerState[r.state].total++;
      const filled = [r.animalType, r.observationDate, r.state, r.city, r.inclusionDate].filter(Boolean).length;
      fieldsPerState[r.state].complete += filled / 5;
    });
    return Object.entries(byEdu).map(([edu, { count, estados }]) => {
      const stateArr = Array.from(estados);
      const avgReg = stateArr.reduce((sum, uf) => sum + (regPerState[uf] || 0), 0) / Math.max(stateArr.length, 1);
      const avgComplete = stateArr.reduce((sum, uf) => {
        const f = fieldsPerState[uf];
        return sum + (f ? (f.complete / f.total) * 100 : 0);
      }, 0) / Math.max(stateArr.length, 1);
      return { escolaridade: edu, colaboradores: count, mediaRegistros: Math.round(avgReg), completude: Math.round(avgComplete) };
    }).sort((a, b) => b.colaboradores - a.colaboradores).slice(0, 8);
  }, [colaboradores, registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Formação vs Qualidade dos Registros</CardTitle><InfoTooltip text="Correlação entre escolaridade dos colaboradores e a qualidade dos registros. Média de registros = total de registros nas UFs associadas à escolaridade / nº de UFs. Completude = percentual médio de campos preenchidos (animal, data observação, estado, cidade, data inclusão)." /></div>
        <p className="text-sm text-muted-foreground">Correlação entre escolaridade, volume e completude.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis dataKey="escolaridade" type="category" width={130} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar dataKey="mediaRegistros" name="Média Registros (UF)" fill="hsl(var(--chart-2))" radius={[0,4,4,0]} />
            <Bar dataKey="completude" name="Completude (%)" fill="hsl(var(--chart-4))" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── 3. Retention ── */
function RetentionCard({ registros }: { registros: Registro[] }) {
  const data = useMemo(() => {
    const byState: Record<string, Date[]> = {};
    registros.forEach(r => { if (!byState[r.state]) byState[r.state] = []; byState[r.state].push(new Date(r.inclusionDate)); });
    return Object.entries(byState).map(([state, dates]) => {
      dates.sort((a, b) => a.getTime() - b.getTime());
      const spanDays = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      const months = new Set(dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));
      const dailyRate = spanDays > 0 ? dates.length / spanDays : 0;
      return { state, total: dates.length, spanDays: Math.round(spanDays), activeMonths: months.size, dailyRate };
    }).filter(s => s.total >= 5).sort((a, b) => (b.spanDays * b.total) - (a.spanDays * a.total)).slice(0, 12);
  }, [registros]);

  const chartData = data.map(d => ({ state: d.state, registros: d.total, diasAtivo: d.spanDays, taxaDiaria: Number((d.dailyRate * 100).toFixed(1)) }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Retenção e Consistência</CardTitle><InfoTooltip text="Dias Ativo = intervalo entre o primeiro e último registro da UF. Meses Ativos = meses distintos com pelo menos um registro. Taxa Diária = (total de registros / dias ativo) × 100. Exibe apenas UFs com 5+ registros, ordenadas por atividade total." /></div>
        <p className="text-sm text-muted-foreground">UFs que mantêm registros consistentes por mais tempo.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="state" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="registros" name="Total Registros" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} />
            <Bar yAxisId="left" dataKey="diasAtivo" name="Dias Ativo" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} />
            <Bar yAxisId="right" dataKey="taxaDiaria" name="Taxa Diária (×100)" fill="hsl(var(--chart-5))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {data.slice(0, 4).map(d => (
            <div key={d.state} className="rounded-lg border p-3">
              <p className="text-lg font-bold text-primary">{d.state}</p>
              <p className="text-xs text-muted-foreground">{d.total} registros em {d.spanDays} dias</p>
              <p className="text-xs text-muted-foreground">{d.activeMonths} meses ativos</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 4. Active Profile Clustering ── */
function ProfileClusterCard({ colaboradores, registros }: { colaboradores: Colaborador[]; registros: Registro[] }) {
  const clusters = useMemo(() => {
    const regPerState: Record<string, number> = {};
    registros.forEach(r => { regPerState[r.state] = (regPerState[r.state] || 0) + 1; });

    // Enrich collaborators with score
    const enriched = colaboradores.map(c => {
      const age = ageFromDate(c.dataNascimento);
      const regs = regPerState[c.estado] || 0;
      const region = STATE_TO_REGION[c.estado] || 'Desconhecido';
      return { ...c, age, regs, region };
    });

    // Cluster by activity level + profile
    type Cluster = { name: string; emoji: string; description: string; count: number; avgAge: number; topRegion: string; avgRegs: number; gender: Record<string, number>; education: Record<string, number> };
    const clusterDefs: Cluster[] = [
      { name: 'Exploradores Urbanos', emoji: '🏙️', description: 'Alta atividade em regiões metropolitanas (Sudeste/Sul)', count: 0, avgAge: 0, topRegion: '', avgRegs: 0, gender: {}, education: {} },
      { name: 'Sentinelas da Natureza', emoji: '🌿', description: 'Atividade consistente em regiões de alta biodiversidade', count: 0, avgAge: 0, topRegion: '', avgRegs: 0, gender: {}, education: {} },
      { name: 'Observadores Ocasionais', emoji: '👀', description: 'Contribuição esporádica, baixo volume', count: 0, avgAge: 0, topRegion: '', avgRegs: 0, gender: {}, education: {} },
      { name: 'Acadêmicos Engajados', emoji: '🎓', description: 'Alta formação com contribuições de qualidade', count: 0, avgAge: 0, topRegion: '', avgRegs: 0, gender: {}, education: {} },
    ];

    const ages: number[][] = [[], [], [], []];

    enriched.forEach(c => {
      const isHighEdu = ['Doutorado', 'Mestrado', 'Especialização', 'Pós Graduação'].some(e => (c.escolaridade || '').includes(e));
      const isUrban = ['Sudeste', 'Sul'].includes(c.region);
      const isHighBio = ['Norte', 'Centro-Oeste'].includes(c.region);
      const highActivity = c.regs > (registros.length / 27); // above average per state

      let idx: number;
      if (isHighEdu && highActivity) idx = 3;
      else if (isUrban && highActivity) idx = 0;
      else if (isHighBio) idx = 1;
      else idx = 2;

      clusterDefs[idx].count++;
      ages[idx].push(c.age);
      const g = c.genero || 'Não informado';
      clusterDefs[idx].gender[g] = (clusterDefs[idx].gender[g] || 0) + 1;
      const e = c.escolaridade || 'Não informado';
      clusterDefs[idx].education[e] = (clusterDefs[idx].education[e] || 0) + 1;
    });

    clusterDefs.forEach((cl, i) => {
      cl.avgAge = ages[i].length > 0 ? Math.round(ages[i].reduce((a, b) => a + b, 0) / ages[i].length) : 0;
      const topGender = Object.entries(cl.gender).sort((a, b) => b[1] - a[1])[0];
      cl.topRegion = topGender ? topGender[0] : '';
    });

    return clusterDefs;
  }, [colaboradores, registros]);

  const total = colaboradores.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Perfil de Usuários Ativos — Clusterização</CardTitle><InfoTooltip text="Agrupamento baseado em regras: Acadêmicos Engajados = alta formação + alta atividade; Exploradores Urbanos = regiões Sudeste/Sul + alta atividade; Sentinelas = regiões Norte/Centro-Oeste; Observadores = demais. Alta atividade = registros da UF acima da média nacional por estado." /></div>
        <p className="text-sm text-muted-foreground">Agrupamento por idade, gênero, formação, região e volume de registros.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map(cl => {
            const pct = total > 0 ? ((cl.count / total) * 100).toFixed(1) : '0';
            const topEdu = Object.entries(cl.education).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(', ');
            const topGender = Object.entries(cl.gender).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([k]) => k).join('');
            return (
              <div key={cl.name} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{cl.emoji} {cl.name}</h4>
                  <Badge variant="secondary">{pct}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{cl.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Qtd:</span> <strong>{cl.count.toLocaleString('pt-BR')}</strong></div>
                  <div><span className="text-muted-foreground">Idade média:</span> <strong>{cl.avgAge}</strong></div>
                  <div><span className="text-muted-foreground">Gênero top:</span> <strong>{topGender}</strong></div>
                </div>
                <p className="text-[10px] text-muted-foreground truncate" title={topEdu}>Formação: {topEdu}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 5. Seasonal Heatmap ── */
function SeasonalHeatmapCard({ registros }: { registros: Registro[] }) {
  const { heatData, animals } = useMemo(() => {
    const monthAnimal: Record<string, Record<string, number>> = {};
    const animalCounts: Record<string, number> = {};
    registros.forEach(r => {
      const d = new Date(r.observationDate);
      if (isNaN(d.getTime())) return;
      const month = d.getMonth();
      const animal = r.animalType;
      animalCounts[animal] = (animalCounts[animal] || 0) + 1;
      const key = `${month}`;
      if (!monthAnimal[key]) monthAnimal[key] = {};
      monthAnimal[key][animal] = (monthAnimal[key][animal] || 0) + 1;
    });
    const topAnimals = Object.entries(animalCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: { month: string; animal: string; count: number }[] = [];
    for (let m = 0; m < 12; m++) {
      topAnimals.forEach(animal => {
        data.push({ month: monthNames[m], animal, count: monthAnimal[`${m}`]?.[animal] || 0 });
      });
    }
    return { heatData: data, animals: topAnimals };
  }, [registros]);

  const maxCount = Math.max(...heatData.map(d => d.count), 1);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Padrões Sazonais — Heatmap Temporal</CardTitle><InfoTooltip text="Heatmap de contagem cruzando mês de observação × tipo de animal (top 8 mais frequentes). A intensidade da cor é proporcional à contagem relativa ao máximo observado. Permite identificar picos sazonais de cada espécie." /></div>
        <p className="text-sm text-muted-foreground">Cruzamento de mês × tipo de animal para identificar sazonalidade.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-1 font-medium text-muted-foreground w-[150px]">Animal</th>
                {monthNames.map(m => <th key={m} className="p-1 text-center font-medium text-muted-foreground">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {animals.map(animal => (
                <tr key={animal}>
                  <td className="p-1 truncate max-w-[150px]" title={animal}>{animal}</td>
                  {monthNames.map(month => {
                    const entry = heatData.find(d => d.month === month && d.animal === animal);
                    const count = entry?.count || 0;
                    const intensity = count / maxCount;
                    const bg = count === 0
                      ? 'hsl(var(--muted))'
                      : `hsl(var(--chart-1) / ${Math.max(0.15, intensity)})`;
                    return (
                      <td key={month} className="p-1 text-center" title={`${animal} — ${month}: ${count}`}>
                        <div className="rounded h-7 flex items-center justify-center text-[10px] font-mono" style={{ backgroundColor: bg }}>
                          {count > 0 ? count : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 6. Engagement Funnel (DAU/MAU, Retention) ── */
function EngagementFunnelCard({ registros }: { registros: Registro[] }) {
  const metrics = useMemo(() => {
    const now = new Date('2026-04-08');
    const dayMs = 24 * 60 * 60 * 1000;

    // Group by state as proxy for user groups
    const byState: Record<string, Date[]> = {};
    registros.forEach(r => {
      if (!byState[r.state]) byState[r.state] = [];
      byState[r.state].push(new Date(r.inclusionDate));
    });

    const states = Object.keys(byState);
    const totalStates = states.length;

    // DAU: states active today (last 24h)
    const dau = states.filter(s => byState[s].some(d => (now.getTime() - d.getTime()) < dayMs)).length;
    // WAU: last 7 days
    const wau = states.filter(s => byState[s].some(d => (now.getTime() - d.getTime()) < 7 * dayMs)).length;
    // MAU: last 30 days
    const mau = states.filter(s => byState[s].some(d => (now.getTime() - d.getTime()) < 30 * dayMs)).length;

    // Retention D1, D7, D30
    const firstActivity: Record<string, Date> = {};
    states.forEach(s => {
      const sorted = [...byState[s]].sort((a, b) => a.getTime() - b.getTime());
      firstActivity[s] = sorted[0];
    });

    const retD1 = states.filter(s => {
      const first = firstActivity[s];
      return byState[s].some(d => {
        const diff = (d.getTime() - first.getTime()) / dayMs;
        return diff >= 1 && diff < 2;
      });
    }).length;

    const retD7 = states.filter(s => {
      const first = firstActivity[s];
      return byState[s].some(d => {
        const diff = (d.getTime() - first.getTime()) / dayMs;
        return diff >= 7 && diff < 14;
      });
    }).length;

    const retD30 = states.filter(s => {
      const first = firstActivity[s];
      return byState[s].some(d => {
        const diff = (d.getTime() - first.getTime()) / dayMs;
        return diff >= 30;
      });
    }).length;

    // Churn: states with no activity in last 30 days that were active before
    const churned = states.filter(s => {
      const latest = Math.max(...byState[s].map(d => d.getTime()));
      return (now.getTime() - latest) > 30 * dayMs;
    }).length;

    return {
      totalStates, dau, wau, mau,
      dauMau: mau > 0 ? (dau / mau * 100).toFixed(1) : '0',
      retD1: totalStates > 0 ? (retD1 / totalStates * 100).toFixed(1) : '0',
      retD7: totalStates > 0 ? (retD7 / totalStates * 100).toFixed(1) : '0',
      retD30: totalStates > 0 ? (retD30 / totalStates * 100).toFixed(1) : '0',
      churnRate: totalStates > 0 ? (churned / totalStates * 100).toFixed(1) : '0',
      funnelData: [
        { stage: 'Total UFs', value: totalStates },
        { stage: 'MAU (30d)', value: mau },
        { stage: 'WAU (7d)', value: wau },
        { stage: 'DAU (hoje)', value: dau },
      ]
    };
  }, [registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Funil de Engajamento</CardTitle><InfoTooltip text="DAU/MAU = UFs ativas hoje / ativas nos últimos 30 dias. Retenção D1/D7/D30 = % de UFs que registraram atividade 1, 7 e 30 dias após o primeiro registro. Churn = UFs sem atividade nos últimos 30 dias. Usa UFs como proxy para grupos de usuários." /></div>
        <p className="text-sm text-muted-foreground">DAU/MAU, retenção D1/D7/D30 e churn por UF.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.funnelData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="value" name="UFs" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{metrics.dauMau}%</p>
              <p className="text-xs text-muted-foreground">DAU/MAU Ratio</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{metrics.churnRate}%</p>
              <p className="text-xs text-muted-foreground">Churn Rate (30d)</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{metrics.retD1}%</p>
              <p className="text-xs text-muted-foreground">Retenção D1</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{metrics.retD7}%</p>
              <p className="text-xs text-muted-foreground">Retenção D7</p>
            </div>
            <div className="rounded-lg border p-3 text-center col-span-2">
              <p className="text-2xl font-bold">{metrics.retD30}%</p>
              <p className="text-xs text-muted-foreground">Retenção D30</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 7. Opportunity Map ── */
function OpportunityMapCard({ colaboradores, registros }: { colaboradores: Colaborador[]; registros: Registro[] }) {
  const data = useMemo(() => {
    const colabPerState: Record<string, number> = {};
    colaboradores.forEach(c => { colabPerState[c.estado] = (colabPerState[c.estado] || 0) + 1; });
    const regPerState: Record<string, number> = {};
    registros.forEach(r => { regPerState[r.state] = (regPerState[r.state] || 0) + 1; });

    return Object.keys({ ...colabPerState, ...regPerState }).map(uf => ({
      uf,
      colaboradores: colabPerState[uf] || 0,
      registros: regPerState[uf] || 0,
      ratio: (colabPerState[uf] || 0) > 0 ? ((regPerState[uf] || 0) / (colabPerState[uf] || 1)).toFixed(1) : '0',
      region: STATE_TO_REGION[uf] || '',
    })).sort((a, b) => b.colaboradores - a.colaboradores);
  }, [colaboradores, registros]);

  const COLORS = Object.values(REGION_COLORS);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Mapa de Oportunidades</CardTitle><InfoTooltip text="Dispersão colaboradores × registros por UF. Ratio = registros / colaboradores. UFs com ratio baixo (<1) indicam potencial subaproveitado — muitos colaboradores mas poucos registros. Útil para direcionar campanhas de engajamento." /></div>
        <p className="text-sm text-muted-foreground">Mais colaboradores = mais registros? Análise por UF.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="colaboradores" name="Colaboradores" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: 'Colaboradores', position: 'bottom', fontSize: 11 }} />
              <YAxis dataKey="registros" name="Registros" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: 'Registros', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <ZAxis range={[60, 400]} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(val: number, name: string) => [val, name]}
                labelFormatter={() => ''} />
              <Scatter data={data} name="UFs">
                {data.map((entry, i) => (
                  <Cell key={entry.uf} fill={COLORS[REGION_ORDER.indexOf(entry.region) % COLORS.length] || COLORS[0]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="space-y-1 max-h-[350px] overflow-auto">
            <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground border-b pb-1">
              <span>UF</span><span>Colab.</span><span>Registros</span><span>Ratio</span>
            </div>
            {data.map(d => (
              <div key={d.uf} className="grid grid-cols-4 text-xs py-0.5">
                <span className="font-medium">{d.uf}</span>
                <span>{d.colaboradores}</span>
                <span>{d.registros}</span>
                <span className={Number(d.ratio) < 1 ? 'text-destructive' : 'text-primary'}>{d.ratio}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ── */
const Insights = () => {
  const { data: registros, loading: loadingReg } = useRegistros();
  const { data: colaboradores, loading: loadingColab } = useColaboradores();

  if (loadingReg || loadingColab) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProfileClusterCard colaboradores={colaboradores} registros={registros} />
        <SpeciesDiversityCard registros={registros} />
        <SeasonalHeatmapCard registros={registros} />
        <EducationQualityCard colaboradores={colaboradores} registros={registros} />
        <EngagementFunnelCard registros={registros} />
        <RetentionCard registros={registros} />
        <OpportunityMapCard colaboradores={colaboradores} registros={registros} />
      </main>
    </div>
  );
};

export default Insights;
