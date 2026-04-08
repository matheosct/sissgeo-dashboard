import { useMemo } from 'react';
import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bot, TrendingUp, Users } from 'lucide-react';
import { Registro } from '@/lib/dataUtils';
import { Colaborador } from '@/lib/colaboradorUtils';
import { STATE_TO_REGION } from '@/lib/regionUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';

/* ── 1. Forecast (Simple ARIMA-like: linear regression on daily counts) ── */
function ForecastCard({ registros }: { registros: Registro[] }) {
  const { historical, forecast, stats } = useMemo(() => {
    // Aggregate daily counts
    const dailyCounts: Record<string, number> = {};
    registros.forEach(r => {
      const d = new Date(r.inclusionDate);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      dailyCounts[key] = (dailyCounts[key] || 0) + 1;
    });

    const sorted = Object.entries(dailyCounts).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length < 3) return { historical: [], forecast: [], stats: { avg: 0, trend: 0, total7d: 0 } };

    // Use last 30 days for regression
    const recent = sorted.slice(-30);
    const n = recent.length;
    const xs = recent.map((_, i) => i);
    const ys = recent.map(([, c]) => c);
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    const ssXY = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0);
    const ssXX = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
    const slope = ssXX > 0 ? ssXY / ssXX : 0;
    const intercept = yMean - slope * xMean;

    // Historical data for chart
    const hist = recent.slice(-14).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      registros: count,
      tipo: 'real' as const,
    }));

    // Forecast next 7 days
    const lastDate = new Date(recent[recent.length - 1][0]);
    const fc: typeof hist = [];
    let total7d = 0;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
      const predicted = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
      total7d += predicted;
      fc.push({
        date: d.toISOString().slice(5, 10),
        registros: predicted,
        tipo: 'previsão' as const,
      });
    }

    return {
      historical: hist,
      forecast: fc,
      stats: { avg: Math.round(yMean), trend: Number(slope.toFixed(2)), total7d },
    };
  }, [registros]);

  const chartData = [
    ...historical.map(d => ({ ...d, real: d.registros, previsao: undefined as number | undefined })),
    ...forecast.map(d => ({ ...d, real: undefined as number | undefined, previsao: d.registros })),
  ];

  // Connect the two lines by duplicating last historical point
  if (historical.length > 0 && forecast.length > 0) {
    const bridge = historical[historical.length - 1];
    chartData.splice(historical.length, 0, {
      date: bridge.date,
      registros: bridge.registros,
      tipo: 'previsão',
      real: undefined,
      previsao: bridge.registros,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Previsão de Registros (7 dias)</CardTitle></div>
        <p className="text-sm text-muted-foreground">Modelo de regressão linear sobre série temporal diária (últimos 30 dias).</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.avg}</p>
            <p className="text-xs text-muted-foreground">Média diária</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: stats.trend >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))' }}>
              {stats.trend > 0 ? '+' : ''}{stats.trend}
            </p>
            <p className="text-xs text-muted-foreground">Tendência/dia</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{stats.total7d}</p>
            <p className="text-xs text-muted-foreground">Previsão 7d</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Line type="monotone" dataKey="real" name="Real" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            <Line type="monotone" dataKey="previsao" name="Previsão" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Modelo simplificado (regressão linear). Para produção, considerar ARIMA/Prophet com sazonalidade.
        </p>
      </CardContent>
    </Card>
  );
}

/* ── 2. User Similarity (Collaborative Filtering) ── */
function UserSimilarityCard({ colaboradores, registros }: { colaboradores: Colaborador[]; registros: Registro[] }) {
  const similarities = useMemo(() => {
    // Build user-animal matrix by state (as proxy for users)
    const stateAnimals: Record<string, Record<string, number>> = {};
    registros.forEach(r => {
      if (!stateAnimals[r.state]) stateAnimals[r.state] = {};
      stateAnimals[r.state][r.animalType] = (stateAnimals[r.state][r.animalType] || 0) + 1;
    });

    const states = Object.keys(stateAnimals);
    const allAnimals = [...new Set(registros.map(r => r.animalType))];

    // Cosine similarity between states
    function cosine(a: Record<string, number>, b: Record<string, number>): number {
      let dot = 0, magA = 0, magB = 0;
      allAnimals.forEach(animal => {
        const va = a[animal] || 0;
        const vb = b[animal] || 0;
        dot += va * vb;
        magA += va * va;
        magB += vb * vb;
      });
      return magA > 0 && magB > 0 ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    }

    // Find top pairs
    const pairs: { stateA: string; stateB: string; similarity: number; sharedAnimals: string[] }[] = [];
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const sim = cosine(stateAnimals[states[i]], stateAnimals[states[j]]);
        const shared = allAnimals.filter(a => (stateAnimals[states[i]][a] || 0) > 0 && (stateAnimals[states[j]][a] || 0) > 0);
        pairs.push({ stateA: states[i], stateB: states[j], similarity: sim, sharedAnimals: shared });
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity);

    // Group: for each state, find most similar
    const stateProfiles = states.map(s => {
      const colabs = colaboradores.filter(c => c.estado === s);
      const topSimilar = pairs
        .filter(p => p.stateA === s || p.stateB === s)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .map(p => ({
          other: p.stateA === s ? p.stateB : p.stateA,
          similarity: p.similarity,
          sharedCount: p.sharedAnimals.length,
        }));

      return {
        state: s,
        region: STATE_TO_REGION[s] || '',
        colaboradores: colabs.length,
        registros: Object.values(stateAnimals[s]).reduce((a, b) => a + b, 0),
        topSimilar,
      };
    }).sort((a, b) => b.registros - a.registros).slice(0, 10);

    return { topPairs: pairs.slice(0, 8), stateProfiles };
  }, [colaboradores, registros]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><CardTitle className="text-lg">Similaridade entre Usuários (por UF)</CardTitle></div>
        <p className="text-sm text-muted-foreground">Collaborative filtering: similaridade cosseno entre perfis de registros por estado.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Top Pares Mais Similares</h4>
            <div className="space-y-2">
              {similarities.topPairs.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{p.stateA}</Badge>
                    <span className="text-xs text-muted-foreground">↔</span>
                    <Badge variant="outline">{p.stateB}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.similarity * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{(p.similarity * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-muted-foreground">{p.sharedAnimals.length} spp</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Perfis por UF — Vizinhos Mais Próximos</h4>
            <div className="space-y-2 max-h-[350px] overflow-auto">
              {similarities.stateProfiles.map(sp => (
                <div key={sp.state} className="rounded-lg border p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge>{sp.state}</Badge>
                      <span className="text-xs text-muted-foreground">{sp.region}</span>
                    </div>
                    <span className="text-xs">{sp.registros} reg.</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {sp.topSimilar.map(ts => (
                      <span key={ts.other} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                        {ts.other} ({(ts.similarity * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ── */
const Robots = () => {
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
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Análises Preditivas</h2>
          <Badge variant="secondary" className="ml-2">Experimental</Badge>
        </div>
        <ForecastCard registros={registros} />
        <UserSimilarityCard colaboradores={colaboradores} registros={registros} />
      </main>
    </div>
  );
};

export default Robots;
