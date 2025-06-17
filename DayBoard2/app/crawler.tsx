// crawler.tsx
import axios from 'axios';

const BASE_URL = 'https://www.dsbmobile.de';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'User-Agent': 'ReactNativeApp',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'de-DE,de;q=0.9',
  },
  // we'll override redirects/status per-request
});

let cookieHeader = '';

// Grab just the "name=value" part from any Set-Cookie header
function extractCookies(setCookie?: string | string[]): string {
  if (!setCookie) return '';
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map(c => c.split(';')[0]).join('; ');
}

// Parse all <input type="hidden"> fields into a name→value map
function parseHiddenFields(html: string): Record<string, string> {
  const re = /<input[^>]*type=["']hidden["'][^>]*>/gi;
  const map: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const tag = match[0];
    const nameM = /name=["']([^"']+)["']/.exec(tag);
    const valueM = /value=["']([^"']*)["']/.exec(tag);
    if (nameM) {
      map[nameM[1]] = valueM ? valueM[1] : '';
    }
  }
  return map;
}

export async function login(username: string, password: string): Promise<void> {
  // 1) GET the login page (no auto-redirect)
  const getRes = await api.get('/Login.aspx', {
    maxRedirects: 0,
    validateStatus: s => s === 200 || s === 302,
  });

  // 2) capture the session cookie
  cookieHeader = extractCookies(getRes.headers['set-cookie']);

  // 3) if it 302’d, follow once to get the form HTML
  let html = getRes.data;
  if (getRes.status === 302) {
    const follow = await api.get(getRes.headers.location!, {
      headers: { Cookie: cookieHeader },
      maxRedirects: 0,
      validateStatus: s => s === 200,
    });
    cookieHeader += '; ' + extractCookies(follow.headers['set-cookie']);
    html = follow.data;
  }

  // 4) parse all hidden inputs
  const hidden = parseHiddenFields(html);

  // 5) build the form data
  const params = new URLSearchParams();
  // include all ASP.NET hidden fields
  [
    '__LASTFOCUS',
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTTARGET',
    '__EVENTARGUMENT',
    '__EVENTVALIDATION',
  ].forEach(key => {
    params.append(key, hidden[key] || '');
  });
  // your credential fields
  params.append('txtUser', username);
  params.append('txtPass', password);
  // the submit button
  params.append('ctl03', 'Anmelden');

  // 6) POST credentials (no auto-redirect)
  const postRes = await api.post(
    '/Login.aspx',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader,
        Origin: BASE_URL,
        Referer: `${BASE_URL}/Login.aspx`,
      },
      maxRedirects: 0,
      validateStatus: s => s === 200 || s === 302,
    }
  );

  if (postRes.status !== 302) {
    console.error('Login failed, HTML:', postRes.data);
    throw new Error('Login failed: expected 302 redirect');
  }

  // 7) capture any new cookies & follow redirect to establish session
  cookieHeader += '; ' + extractCookies(postRes.headers['set-cookie']);
  await api.get(
    postRes.headers.location!,
    { headers: { Cookie: cookieHeader } }
  );
}

export async function fetchDashboard(): Promise<string> {
  const res = await api.get('/Default.aspx?menu=0&item=0', {
    headers: {
      Cookie: cookieHeader,
      Referer: `${BASE_URL}/Default.aspx?menu=0&item=0`,
    },
  });
  return res.data;
}
