const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
  document.cookie = `accessToken=${access}; path=/; max-age=86400; SameSite=Lax`;
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  document.cookie = 'accessToken=; path=/; max-age=0';
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { accessToken } = getTokens();
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string>),
  };

  if (accessToken && !config.skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (!(config.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...config, headers });
  } catch {
    console.error(`[API] Network error: ${API_BASE}${endpoint}`);
    return { success: false, error: 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.' };
  }

  if (res.status === 401 && !config.skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      try { res = await fetch(`${API_BASE}${endpoint}`, { ...config, headers }); }
      catch { return { success: false, error: 'تعذر الاتصال بالخادم.' }; }
    } else {
      clearTokens();
      return { success: false, error: 'انتهت الجلسة. سجل الدخول مرة أخرى.' };
    }
  }

  let data: any;
  try { data = await res.json(); }
  catch { data = {}; }

  if (!res.ok) {
    const msg = data?.message;
    console.error(`[API] ${res.status} ${endpoint}:`, msg);
    return { success: false, error: Array.isArray(msg) ? msg[0] : msg || 'Request failed' };
  }
  return { success: true, data };
}

export { setTokens, clearTokens, getTokens };
