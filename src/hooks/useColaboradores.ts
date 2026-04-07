import { useEffect, useState, useCallback } from 'react';
import { Colaborador, loadColaboradores, parseColaboradoresCSV } from '@/lib/colaboradorUtils';

export function useColaboradores() {
  const [data, setData] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColaboradores().then(records => {
      setData(records);
      setLoading(false);
    });
  }, []);

  const updateFromCSV = useCallback((text: string) => {
    const records = parseColaboradoresCSV(text);
    if (records.length > 0) setData(records);
    return records.length;
  }, []);

  return { data, loading, updateFromCSV };
}
