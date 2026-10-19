import { useCallback, useState } from 'react';

export default function useMutation<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const run = useCallback(async (...args: Args): Promise<Result> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await fn(...args);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The request failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { run, loading, error, success };
}
