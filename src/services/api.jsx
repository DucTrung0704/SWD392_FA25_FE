// Lightweight API client with auth token, JSON handling, and timeout

const API_BASE_URL = '/api';

const getToken = () =>
  localStorage.getItem('app_auth_user_token') || localStorage.getItem('accessToken');

const buildHeaders = (extra = {}, hasBody = false) => {
  const token = getToken();
  const headers = {
    'accept': 'application/json',
    ...extra
  };
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const withTimeout = async (promise, ms = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const resp = await promise(controller.signal);
    return resp;
  } finally {
    clearTimeout(timer);
  }
};

const request = async (method, path, { headers, params, body, raw = false, timeoutMs } = {}) => {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`, window.location.origin);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    });
  }

  const hasJsonBody = body !== undefined && body !== null && !(body instanceof FormData);

  const requestHeaders = buildHeaders(headers, hasJsonBody);
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url.toString()}`);
    console.log('[API] Headers:', requestHeaders);
    if (body) {
      console.log('[API] Body:', body);
    }
  }
  
  const doFetch = (signal) =>
    fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: hasJsonBody ? JSON.stringify(body) : body,
      signal,
    });

  const res = await withTimeout(doFetch, timeoutMs || 20000);
  
  let data;
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (isJson) {
    data = await res.json().catch(() => ({}));
  } else if (raw) {
    data = await res.text();
  }

  // Debug logging response (skip logging for 404 to reduce spam, handled in services)
  if (process.env.NODE_ENV === 'development' && res.status !== 404) {
    console.log(`[API] Response status: ${res.status}`);
  }

  if (!res.ok) {
    const message = data?.message || `HTTP error! status: ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.response = { status: res.status, data };
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options = {}) => request('POST', path, { ...options, body }),
  put: (path, body, options = {}) => request('PUT', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};

export default api;


