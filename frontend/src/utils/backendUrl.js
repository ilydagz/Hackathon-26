const normalizeBackendOrigin = (value) => {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.replace(/\/api$/, '');
};

const configuredBase = import.meta.env.VITE_API_BASE_URL || '';
const defaultBase = import.meta.env.DEV ? 'http://localhost:8000' : '';
const backendOrigin = normalizeBackendOrigin(configuredBase || defaultBase);

export const BACKEND_ORIGIN = backendOrigin;
export const API_BASE_URL = backendOrigin ? `${backendOrigin}/api` : '/api';

export const buildApiUrl = (path = '') => {
  const cleanPath = String(path).replace(/^\/+/, '');
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
};

export const buildStaticUrl = (path = '') => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = String(path).replace(/^\/+/, '');
  if (!backendOrigin) return `/static/${cleanPath}`;
  return `${backendOrigin}/static/${cleanPath}`;
};
