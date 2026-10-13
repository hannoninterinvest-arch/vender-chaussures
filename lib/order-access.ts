export function rememberOrderAccess(id: string, token: string) {
  if (typeof window !== 'undefined' && /^[a-f0-9]{64}$/.test(token)) sessionStorage.setItem(`order-access:${id}`, token);
}

export function orderAccessToken(id: string) {
  if (typeof window === 'undefined') return '';
  const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
  if (token && window.location.pathname === `/commande/${encodeURIComponent(id)}`) rememberOrderAccess(id, token);
  return sessionStorage.getItem(`order-access:${id}`) || '';
}

export function orderPath(id: string, token: string) {
  return `/commande/${encodeURIComponent(id)}#token=${encodeURIComponent(token)}`;
}
