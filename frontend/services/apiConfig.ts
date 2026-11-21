// Helper to get sanitized API URL without trailing slash issues
export const getApiUrl = (endpoint: string = ''): string => {
  const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '');
  if (!endpoint) return base;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};
