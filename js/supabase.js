import { CONFIG } from './config.js';

const url = CONFIG.supabaseUrl.replace(/\/$/, '');
const key = CONFIG.supabaseAnonKey;
export const isConfigured = () => /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && !!key && !key.includes('YOUR_');
const headers = () => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

export async function readCollection(table) {
  if (!isConfigured()) return null;
  if (!['projects','services','blog_posts','team_members','testimonials','clients'].includes(table)) return null;
  try {
    const response = await fetch(`${url}/rest/v1/${table}?select=*`, {headers:headers(), signal:AbortSignal.timeout(5000)});
    if (!response.ok) throw new Error('Public content request failed');
    const data = await response.json();
    return Array.isArray(data) && data.length ? data : null;
  } catch { return null; }
}

export async function insertRecord(table, values) {
  if (!['contact_messages','newsletter_subscribers'].includes(table) || !isConfigured()) {
    throw new Error('not_configured');
  }
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method:'POST', headers:{...headers(), Prefer:'return=minimal'}, body:JSON.stringify(values), signal:AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`request_failed_${response.status}`);
}
