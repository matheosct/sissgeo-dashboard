import { useMemo } from 'react';
import { Colaborador } from '@/lib/colaboradorUtils';
import { Card, CardContent } from '@/components/ui/card';
import { STATE_TO_REGION, REGION_ORDER, REGION_COLORS } from '@/lib/regionUtils';
import { Globe } from 'lucide-react';

interface Props {
  colaboradores: Colaborador[];
}

export function RegionalCard({ colaboradores }: Props) {
  const byRegion = useMemo(() => {
    const counts: Record<string, { total: number; estados: Record<string, number> }> = {};
    REGION_ORDER.forEach(r => { counts[r] = { total: 0, estados: {} }; });
    colaboradores.forEach(c => {
      const region = STATE_TO_REGION[c.estado];
      if (region) {
        counts[region].total++;
        counts[region].estados[c.estado] = (counts[region].estados[c.estado] || 0) + 1;
      }
    });
    return counts;
  }, [colaboradores]);

  const total = colaboradores.length;

  return (
    <Card className='col-span-3'>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Colaboradores por Região</p>
        </div>
        <div className="space-y-2">
          {REGION_ORDER.map(region => {
            const data = byRegion[region];
            const pct = total > 0 ? (data.total / total * 100) : 0;
            const stateList = Object.entries(data.estados)
              .sort((a, b) => b[1] - a[1])
              .map(([uf, n]) => `${uf}: ${n}`)
              .join(', ');
            return (
              <div key={region}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium">{region}</span>
                  <span className="text-muted-foreground">{data.total.toLocaleString('pt-BR')} ({pct.toFixed(1)}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: REGION_COLORS[region] }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={stateList}>{stateList}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
