import { useState, useMemo } from 'react';
import { Registro, getTopN, STATE_NAMES } from '@/lib/dataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

interface Props {
  data: Registro[];
}

// Simplified Brazil SVG paths by state
const STATE_PATHS: Record<string, string> = {
  AC: "M95,330 L95,365 L130,365 L130,330 Z",
  AM: "M105,235 L105,320 L230,320 L230,270 L280,270 L280,235 L230,200 L160,200 Z",
  RR: "M175,155 L175,200 L230,200 L230,155 Z",
  AP: "M310,170 L310,215 L345,215 L345,170 Z",
  PA: "M230,200 L230,290 L355,290 L355,230 L310,215 L310,200 Z",
  MA: "M355,230 L355,290 L410,290 L410,250 L395,230 Z",
  PI: "M395,260 L395,335 L430,335 L430,260 Z",
  CE: "M430,250 L430,300 L475,300 L475,250 Z",
  RN: "M475,260 L475,290 L505,290 L505,260 Z",
  PB: "M465,290 L465,310 L505,310 L505,290 Z",
  PE: "M435,310 L435,335 L505,335 L505,310 Z",
  AL: "M470,335 L470,355 L500,355 L500,335 Z",
  SE: "M465,355 L465,375 L490,375 L490,355 Z",
  BA: "M380,335 L380,430 L470,430 L470,355 L435,335 Z",
  TO: "M330,290 L330,380 L375,380 L375,290 Z",
  GO: "M290,380 L290,440 L370,440 L370,380 Z",
  DF: "M345,395 L345,410 L365,410 L365,395 Z",
  MT: "M195,320 L195,410 L290,410 L290,320 Z",
  MS: "M215,410 L215,480 L290,480 L290,410 Z",
  MG: "M340,400 L340,480 L440,480 L440,400 Z",
  ES: "M440,430 L440,475 L475,475 L475,430 Z",
  RJ: "M400,480 L400,510 L460,510 L460,480 Z",
  SP: "M305,460 L305,510 L395,510 L395,460 Z",
  PR: "M260,490 L260,530 L340,530 L340,490 Z",
  SC: "M280,530 L280,560 L340,560 L340,530 Z",
  RS: "M250,555 L250,615 L325,615 L325,555 Z",
  RO: "M130,320 L130,380 L195,380 L195,320 Z",
};

export function BrazilMap({ data }: Props) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(r => {
      counts[r.state] = (counts[r.state] || 0) + 1;
    });
    return counts;
  }, [data]);

  const maxCount = useMemo(() => Math.max(...Object.values(stateCounts), 1), [stateCounts]);

  const stateAnimals = useMemo(() => {
    const grouped: Record<string, Registro[]> = {};
    data.forEach(r => {
      if (!grouped[r.state]) grouped[r.state] = [];
      grouped[r.state].push(r);
    });
    const result: Record<string, { name: string; count: number }[]> = {};
    Object.entries(grouped).forEach(([state, records]) => {
      result[state] = getTopN(records, r => r.animalType, 3);
    });
    return result;
  }, [data]);

  const getColor = (state: string) => {
    const count = stateCounts[state] || 0;
    const intensity = Math.max(0.08, count / maxCount);
    return `hsla(152, 60%, 36%, ${intensity})`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Map className="h-6 w-6 text-primary" />
        <CardTitle className="text-base font-semibold">Mapa de Registros por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox="70 140 470 500" className="w-full h-auto max-h-[500px]">
            {Object.entries(STATE_PATHS).map(([state, path]) => (
              <path
                key={state}
                d={path}
                fill={getColor(state)}
                stroke="hsl(152, 30%, 60%)"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: hoveredState === state ? 'brightness(0.85)' : 'none',
                  strokeWidth: hoveredState === state ? 2 : 1,
                }}
                onMouseEnter={(e) => {
                  setHoveredState(state);
                  const rect = (e.target as SVGPathElement).ownerSVGElement?.getBoundingClientRect();
                  if (rect) {
                    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }
                }}
                onMouseMove={(e) => {
                  const rect = (e.target as SVGPathElement).ownerSVGElement?.getBoundingClientRect();
                  if (rect) {
                    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }
                }}
                onMouseLeave={() => setHoveredState(null)}
              />
            ))}
            {/* State labels */}
            {Object.entries(STATE_PATHS).map(([state, path]) => {
              const nums = path.match(/\d+/g)?.map(Number) || [];
              const xs = nums.filter((_, i) => i % 2 === 0);
              const ys = nums.filter((_, i) => i % 2 === 1);
              const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
              const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
              return (
                <text
                  key={`label-${state}`}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground pointer-events-none"
                  style={{ fontSize: '9px', fontWeight: 600 }}
                >
                  {state}
                </text>
              );
            })}
          </svg>
          
          {/* Tooltip */}
          {hoveredState && (
            <div
              className="absolute z-50 pointer-events-none bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]"
              style={{
                left: `${mousePos.x + 12}px`,
                top: `${mousePos.y - 10}px`,
                transform: 'translateY(-100%)',
              }}
            >
              <p className="font-semibold text-sm">{STATE_NAMES[hoveredState] || hoveredState}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {(stateCounts[hoveredState] || 0).toLocaleString('pt-BR')} registros
              </p>
              {stateAnimals[hoveredState]?.map((a, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate mr-2">{a.name}</span>
                  <span className="text-muted-foreground shrink-0">{a.count.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Menos</span>
            <div className="flex h-3 rounded-full overflow-hidden">
              {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map(opacity => (
                <div
                  key={opacity}
                  className="w-6 h-full"
                  style={{ backgroundColor: `hsla(152, 60%, 36%, ${opacity})` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Mais</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
