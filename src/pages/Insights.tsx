import { useMemo } from 'react';
import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Leaf, GraduationCap, Clock } from 'lucide-react';
import { STATE_TO_REGION, REGION_ORDER, REGION_COLORS } from '@/lib/regionUtils';
import { Registro } from '@/lib/dataUtils';
import { Colaborador } from '@/lib/colaboradorUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavLink } from '@/components/NavLink';
import { Activity } from 'lucide-react';

/* ── 1. Species Diversity by Region ── */
function SpeciesDiversityCard({ registros }: { registros: Registro[] }) {
  const data = useMemo(() => {
    const speciesByRegion: Record<string, Set<string>> = {};
    const countByRegion: Record<string, number> = {};
    REGION_ORDER.forEach(r => { speciesByRegion[r] = new Set(); countByRegion[r] = 0; });

    registros.forEach(r => {
      const region = STATE_TO_REGION[r.state];
      if (region) {
        speciesByRegion[region].add(r.animalType);
        countByRegion[region]++;
      }
    });

    return REGION_ORDER.map(region => ({
      region,
      especies: speciesByRegion[region].size,
      registros: countByRegion[region],
      shannonIndex: calcShannon(registros.filter(r => STATE_TO_REGION[r.state] === region)),
    }));
  }, [registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Diversidade de Espécies por Região</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Quantidade de espécies únicas, total de registros e índice de Shannon-Wiener por região.
        </p>
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
                const maxShannon = 3.5;
                const pct = Math.min((d.shannonIndex / maxShannon) * 100, 100);
                return (
                  <div key={d.region}>
                    <div className="flex justify-between text-sm">
                      <span>{d.region}</span>
                      <span className="text-muted-foreground font-mono">{d.shannonIndex.toFixed(3)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: REGION_COLORS[d.region] }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Maior índice = maior equilíbrio na distribuição entre espécies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

/* ── 2. Education vs Registration Quality ── */
function EducationQualityCard({ colaboradores, registros }: { colaboradores: Colaborador[]; registros: Registro[] }) {
  const data = useMemo(() => {
    // Group collaborators by education level
    const byEdu: Record<string, { count: number; estados: Set<string> }> = {};
    colaboradores.forEach(c => {
      const edu = c.escolaridade || 'Não informado';
      if (!byEdu[edu]) byEdu[edu] = { count: 0, estados: new Set() };
      byEdu[edu].count++;
      byEdu[edu].estados.add(c.estado);
    });

    // Count registros per state
    const regPerState: Record<string, number> = {};
    const fieldsPerState: Record<string, { total: number; complete: number }> = {};
    registros.forEach(r => {
      regPerState[r.state] = (regPerState[r.state] || 0) + 1;
      if (!fieldsPerState[r.state]) fieldsPerState[r.state] = { total: 0, complete: 0 };
      fieldsPerState[r.state].total++;
      // Completude: all fields non-empty
      const filled = [r.animalType, r.observationDate, r.state, r.city, r.inclusionDate].filter(Boolean).length;
      fieldsPerState[r.state].complete += filled / 5;
    });

    return Object.entries(byEdu)
      .map(([edu, { count, estados }]) => {
        const stateArr = Array.from(estados);
        const avgReg = stateArr.reduce((sum, uf) => sum + (regPerState[uf] || 0), 0) / Math.max(stateArr.length, 1);
        const avgComplete = stateArr.reduce((sum, uf) => {
          const f = fieldsPerState[uf];
          return sum + (f ? (f.complete / f.total) * 100 : 0);
        }, 0) / Math.max(stateArr.length, 1);
        return { escolaridade: edu, colaboradores: count, mediaRegistros: Math.round(avgReg), completude: Math.round(avgComplete) };
      })
      .sort((a, b) => b.colaboradores - a.colaboradores)
      .slice(0, 8);
  }, [colaboradores, registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Formação vs Qualidade dos Registros</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Correlação entre nível de escolaridade, volume médio e completude dos registros por UF.
        </p>
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
        <p className="text-xs text-muted-foreground mt-2">
          Completude mede o preenchimento médio dos campos (animal, datas, localização).
        </p>
      </CardContent>
    </Card>
  );
}

/* ── 3. Retention Analysis ── */
function RetentionCard({ registros }: { registros: Registro[] }) {
  const data = useMemo(() => {
    // Group registros by state and analyze temporal consistency
    const byState: Record<string, Date[]> = {};
    registros.forEach(r => {
      if (!byState[r.state]) byState[r.state] = [];
      byState[r.state].push(new Date(r.inclusionDate));
    });

    // Calculate retention metrics per state
    const stateMetrics = Object.entries(byState).map(([state, dates]) => {
      dates.sort((a, b) => a.getTime() - b.getTime());
      const first = dates[0];
      const last = dates[dates.length - 1];
      const spanDays = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);

      // Monthly activity: count unique months with activity
      const months = new Set(dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));

      // Consistency: registros / span in days (daily rate)
      const dailyRate = spanDays > 0 ? dates.length / spanDays : 0;

      return { state, total: dates.length, spanDays: Math.round(spanDays), activeMonths: months.size, dailyRate };
    });

    // Top retainers: long span + high volume
    return stateMetrics
      .filter(s => s.total >= 5)
      .sort((a, b) => (b.spanDays * b.total) - (a.spanDays * a.total))
      .slice(0, 12);
  }, [registros]);

  const chartData = useMemo(() => {
    return data.map(d => ({
      state: d.state,
      registros: d.total,
      diasAtivo: d.spanDays,
      mesesAtivos: d.activeMonths,
      taxaDiaria: Number((d.dailyRate * 100).toFixed(1)),
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Retenção e Consistência</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Perfis (UFs) que mantêm registros consistentes por mais tempo. Taxa diária × período ativo.
        </p>
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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Dashboard SISS-Geo</h1>
            </div>
            <nav className="flex items-center gap-1">
              <NavLink to="/" label="Registros" />
              <NavLink to="/colaboradores" label="Colaboradores" />
              <NavLink to="/insights" label="Insights" active />
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <SpeciesDiversityCard registros={registros} />
        <EducationQualityCard colaboradores={colaboradores} registros={registros} />
        <RetentionCard registros={registros} />
      </main>
    </div>
  );
};

export default Insights;
