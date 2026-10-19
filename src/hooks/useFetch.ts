import { useCallback, useEffect, useState } from 'react';

export default function useFetch<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
