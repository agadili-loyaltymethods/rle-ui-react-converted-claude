import { apiClient } from '../axios.instance';

export const aiApi = {
  testConnection: () => apiClient.get('/ai-assistant/test-connection'),

  getSuggestions: (payload: unknown) =>
    apiClient.post('/ai-assistant/stream', payload),

  getSuggestionStream: (
    payload: unknown,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): (() => void) => {
    const token = sessionStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/ai-assistant/stream');
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    let lastIndex = 0;
    xhr.onprogress = () => {
      const newData = xhr.responseText.slice(lastIndex);
      lastIndex = xhr.responseText.length;
      if (newData) onChunk(newData);
    };
    xhr.onload = () => onComplete();
    xhr.onerror = () => onError(new Error('Stream error'));
    xhr.send(JSON.stringify(payload));

    return () => xhr.abort();
  },
};
