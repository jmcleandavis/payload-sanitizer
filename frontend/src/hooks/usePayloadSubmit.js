import { useState } from 'react';

export function usePayloadSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitPayload = async (rawJson, options = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Basic client-side validation check before transmission
      const parsed = JSON.parse(rawJson);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/sanitize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsed, options })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Backend processing failed.');
      }

      setResult(resData.data);
    } catch (err) {
      setError(err.message === 'Unexpected end of JSON input' ? 'Input must be a valid JSON string.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submitPayload, result, error, loading };
}
