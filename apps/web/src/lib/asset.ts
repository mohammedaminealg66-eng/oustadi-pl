const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '') || '';

export function getAvatarUrl(key: string | null | undefined): string {
  if (!key) return '';
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  if (key.startsWith('/')) return API_ORIGIN + key;
  return API_ORIGIN + '/' + key;
}

export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) clean = 'https://' + clean;
  try {
    const u = new URL(clean);
    if (u.hostname.includes('youtube.com') || u.hostname === 'youtu.be') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
      if (u.pathname.startsWith('/embed/')) return clean;
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.slice(1).split(/[?#]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    return clean;
  } catch {
    return '';
  }
}
