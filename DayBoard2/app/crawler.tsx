// src/screens/crawler.tsx
import axios, { AxiosInstance } from 'axios';

// Base configuration for DSBmobile API
const BASE_URL = 'https://www.dsbmobile.de';
let api: AxiosInstance;
let cookieHeader = '';

/**
 * Initializes the axios instance and sets cookies (e.g. from a WebView)
 */
export function setCrawlerCookie(c: string) {
  console.log('🛠️ setCrawlerCookie:', c);
  cookieHeader = c;
  api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: cookieHeader,
      'User-Agent': 'ReactNativeApp',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  console.log('🔧 Axios initialized with cookieHeader');
}

/**
 * Logs into DSBmobile and captures cookies for subsequent requests.
 */
export async function login(username: string, password: string): Promise<void> {
  try {
    console.log('➡️ login: GET /Login.aspx');
    const getRes = await axios.get<string>(`${BASE_URL}/Login.aspx`, {
      maxRedirects: 0,
      validateStatus: s => s === 200 || s === 302,
    });

    // Capture initial cookies
    const initial = getRes.headers['set-cookie'] || [];
    cookieHeader = Array.isArray(initial)
      ? initial.map(c => c.split(';')[0]).join('; ')
      : initial.split(';')[0];
    console.log('🔑 login: initial cookieHeader =', cookieHeader);

    // Parse hidden ASP.NET fields
    const html = typeof getRes.data === 'string' ? getRes.data : '';
    const hidden: Record<string, string> = {};
    html.replace(/<input[^>]*type="hidden"[^>]*>/gi, tag => {
      const nameMatch = /name="([^"]+)"/.exec(tag);
      const valueMatch = /value="([^"]*)"/.exec(tag);
      if (nameMatch) hidden[nameMatch[1]] = valueMatch ? valueMatch[1] : '';
      return '';
    });
    console.log('🔍 login: hidden fields =', hidden);

    // Build form payload
    const params = new URLSearchParams();
    ['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION'].forEach(key => {
      params.append(key, hidden[key] || '');
    });
    params.append('txtUser', username);
    params.append('txtPass', password);
    params.append('ctl03', 'Anmelden');
    console.log('➡️ login: POST payload =', params.toString());

    // POST login form
    const postRes = await axios.post(`${BASE_URL}/Login.aspx`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader,
        Referer: `${BASE_URL}/Login.aspx`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      maxRedirects: 0,
      validateStatus: s => s === 200 || s === 302,
    });
    console.log('🔄 login: POST status =', postRes.status);

    if (postRes.status !== 302) {
      console.error('❌ login failed, response HTML:', postRes.data);
      throw new Error('Login failed: expected 302 redirect');
    }

    // Capture cookies after login
    const postCookies = postRes.headers['set-cookie'] || [];
    const newC = Array.isArray(postCookies)
      ? postCookies.map(c => c.split(';')[0]).join('; ')
      : postCookies.split(';')[0];
    cookieHeader = [cookieHeader, newC].filter(Boolean).join('; ');
    console.log('🍪 login: updated cookieHeader =', cookieHeader);

    // Initialize axios with authenticated cookie
    api = axios.create({
      baseURL: BASE_URL,
      headers: {
        Cookie: cookieHeader,
        'User-Agent': 'ReactNativeApp',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    console.log('✅ login: axios instance reconfigured');
  } catch (err) {
    console.error('💥 login error:', err);
    throw err;
  }
}

/**
 * Fetches the raw dashboard HTML for legacy scraping.
 */
export async function fetchDashboard(): Promise<string> {
  try {
    console.log('➡️ fetchDashboard: GET /Default.aspx?menu=0&item=0');
    const res = await api.get<string>('/Default.aspx?menu=0&item=0', {
      headers: { Referer: `${BASE_URL}/Default.aspx?menu=0&item=0` },
    });
    console.log('⬅️ fetchDashboard: status =', res.status);
    console.log('📄 fetchDashboard HTML snippet =', res.data.slice(0, 200));
    return res.data;
  } catch (err) {
    console.error('💥 fetchDashboard error:', err);
    throw err;
  }
}

/**
 * Fetches the JSON timetable data directly.
 */
export async function getData(params: { menu: number; item: number }): Promise<any[]> {
  try {
    console.log('➡️ getData: invoking fetchDashboard()');
    const shell = await fetchDashboard();

    console.log('📄 shell HTML snippet =', shell.slice(0, 300));
    const match = shell.match(/(\/jhw-[0-9a-fA-F-]+\.ashx(?:\/GetData)?)/);
    console.log('🔍 getData: endpoint regex match =', match);
    if (!match) {
      throw new Error('GetData endpoint not found in shell HTML');
    }
    const endpoint = match[1].startsWith('http')
      ? match[1]
      : `${BASE_URL}${match[1]}`;
    console.log('➡️ getData: POST to endpoint =', endpoint, 'payload =', params);

    const res = await api.post(endpoint, params, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Referer: `${BASE_URL}/Default.aspx?menu=${params.menu}&item=${params.item}`,
        Cookie: cookieHeader,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    console.log('⬅️ getData: status =', res.status);
    console.log('📥 getData: data =', res.data);
    return res.data;
  } catch (err) {
    console.error('💥 getData error:', err);
    throw err;
  }
}
