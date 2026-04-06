import { useEffect, useState, useCallback } from 'react';
import { Registro, loadCSV, parseCSVText } from '@/lib/dataUtils';

export function useRegistros() {
  const [data, setData] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCSV().then(records => {
      setData(records);
      setLoading(false);
    });
  }, []);

  const updateFromCSV = useCallback((text: string) => {
    const records = parseCSVText(text);
    if (records.length > 0) {
      setData(records);
    }
    return records.length;
  }, []);

  return { data, loading, updateFromCSV };
}
