import { useEffect, useState } from 'react';
import { Registro, loadCSV } from '@/lib/dataUtils';

export function useRegistros() {
  const [data, setData] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCSV().then(records => {
      setData(records);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
