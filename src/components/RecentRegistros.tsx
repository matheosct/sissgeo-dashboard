import { useState } from 'react';
import { Registro } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  data: Registro[];
}

export function RecentRegistros({ data }: Props) {
  const [visibleCount, setVisibleCount] = useState(10);

  const recent = [...data]
    .sort((a, b) => new Date(b.inclusionDate).getTime() - new Date(a.inclusionDate).getTime())
    .slice(0, visibleCount);

  const canLoadMore = visibleCount < data.length;

  return (
    <Card className="border-0 shadow-sm flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-2 pb-3 shrink-0">
        <Clock className="h-6 w-6 text-primary" />
        <CardTitle className="text-base font-semibold">Registros Mais Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
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
        </ScrollArea>
        {canLoadMore && (
          <div className="p-3 border-t border-border shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setVisibleCount(prev => prev + 10)}
            >
              <ChevronDown className="h-4 w-4" />
              Visualizar mais registros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
