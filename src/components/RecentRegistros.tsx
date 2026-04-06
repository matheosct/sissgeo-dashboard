import { Registro } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface Props {
  data: Registro[];
}

export function RecentRegistros({ data }: Props) {
  const recent = [...data]
    .sort((a, b) => new Date(b.inclusionDate).getTime() - new Date(a.inclusionDate).getTime())
    .slice(0, 10);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Clock className="h-4 w-4 text-primary" />
        <CardTitle className="text-base font-semibold">Registros Mais Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recent.map(r => {
            const d = new Date(r.inclusionDate);
            const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            return (
              <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.animalType}</p>
                  <p className="text-xs text-muted-foreground">{r.city}, {r.state}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-xs text-muted-foreground">{dateStr}</p>
                  <p className="text-xs text-muted-foreground">#{r.id}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
