import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: (...args: unknown[]) => Promise<AxiosResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiCall(...args);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'An error occurred';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        throw err;
      }
    },
    [apiCall]
  );

  return { ...state, execute };
}
