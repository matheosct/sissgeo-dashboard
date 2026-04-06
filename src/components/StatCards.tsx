import { Registro, getTopN } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, MapPin, Building2, PawPrint } from 'lucide-react';

interface Props {
  data: Registro[];
}

export function StatCards({ data }: Props) {
  const topState = getTopN(data, r => r.state, 1)[0];
  const topCity = getTopN(data, r => r.city, 1)[0];
  const topAnimal = getTopN(data, r => r.animalType, 1)[0];

  const cards = [
    {
      title: 'Total de Registros',
      value: data.length.toLocaleString('pt-BR'),
      icon: ClipboardList,
      sub: '',
    },
    {
      title: 'Estado com Mais Registros',
      value: topState?.name || '-',
      icon: MapPin,
      sub: topState ? `${topState.count.toLocaleString('pt-BR')} registros` : '',
    },
    {
      title: 'Cidade com Mais Registros',
      value: topCity?.name || '-',
      icon: Building2,
      sub: topCity ? `${topCity.count.toLocaleString('pt-BR')} registros` : '',
    },
    {
      title: 'Animal Mais Registrado',
      value: topAnimal?.name || '-',
      icon: PawPrint,
      sub: topAnimal ? `${topAnimal.count.toLocaleString('pt-BR')} registros` : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <Card key={c.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            <c.icon className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{c.value}</div>
            {c.sub && <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
