import { Registro, getTopN } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

interface Props {
  data: Registro[];
}

export function TopAnimals({ data }: Props) {
  const top5 = getTopN(data, r => r.animalType, 5);
  const max = top5[0]?.count || 1;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <PawPrint className="h-6 w-6 text-primary" />
        <CardTitle className="text-base font-semibold">Top 5 Tipos de Animais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {top5.map((item, i) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium truncate mr-2">{i + 1}. {item.name}</span>
              <span className="text-muted-foreground shrink-0">{item.count.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(item.count / max) * 100}%`, opacity: 1 - i * 0.15 }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
