import { useState, useMemo, useCallback } from 'react';
import { Registro, getTopN, STATE_NAMES } from '@/lib/dataUtils';
import { STATE_SVG_PATHS } from '@/lib/brazilPaths';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

interface Props {
  data: Registro[];
}

export function BrazilMap({ data }: Props) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  const getColor = useCallback((state: string) => {
    const count = stateCounts[state] || 0;
    const intensity = Math.max(0.08, count / maxCount);
    return `hsla(152, 60%, 36%, ${intensity})`;
  }, [stateCounts, maxCount]);

  const handleMouseMove = useCallback((e: React.MouseEvent, state: string) => {
    const rect = (e.target as SVGPathElement).ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setHoveredState(state);
  }, []);

  // Compute label positions (center of bounding box for each path)
  const labelPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    Object.entries(STATE_SVG_PATHS).forEach(([state, path]) => {
      const nums = path.match(/[\d.]+/g)?.map(Number) || [];
      if (nums.length < 4) return;
      // Use first coordinate as approximate center (SVG paths start near center for these)
      const match = path.match(/^M([\d.]+)\s+([\d.]+)/);
      if (match) {
        // For better centering, parse all absolute coordinates
        const allNums = path.match(/-?[\d.]+/g)?.map(Number) || [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        // Simple heuristic: use the M starting point and scan for bounds
        // Actually let's use a temporary SVG to get bbox - but we can't in Node
        // Use the starting M point as label position
        positions[state] = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
    });
    return positions;
  }, []);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Map className="h-6 w-6 text-primary" />
        <CardTitle className="text-base font-semibold">Mapa de Registros por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox="0 0 1000 912" className="w-full h-auto max-h-[500px]">
            {Object.entries(STATE_SVG_PATHS).map(([state, path]) => (
              <path
                key={state}
                d={path}
                fill={getColor(state)}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: hoveredState === state ? 'brightness(0.8)' : 'none',
                  strokeWidth: hoveredState === state ? 2 : 0.5,
                }}
                onMouseEnter={(e) => handleMouseMove(e, state)}
                onMouseMove={(e) => handleMouseMove(e, state)}
                onMouseLeave={() => setHoveredState(null)}
              />
            ))}
          </svg>
          
          {/* Tooltip */}
          {hoveredState && (
            <div
              className="absolute z-50 pointer-events-none bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]"
              style={{
                left: `${tooltipPos.x + 12}px`,
                top: `${tooltipPos.y - 10}px`,
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
