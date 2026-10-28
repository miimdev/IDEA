import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {localData} from '../js/data.js';
const pages=['index.html','services.html','work.html','project.html','about.html','blog.html','contact.html','404.html'];
for(const page of pages){
 const html=await readFile(new URL(`../${page}`,import.meta.url),'utf8');
 for(const pattern of [/lang="fa"/,/dir="rtl"/,/<main id="main">/,/data-site-header/,/data-site-footer/,/rel="canonical"/,/hreflang="en"/,/application\/ld\+json/]) assert.match(html,pattern,`${page}: ${pattern}`);
 for(const match of html.matchAll(/(?:src|href)="((?:assets|css|js)\/[^"?#]+)"/g)) await access(new URL(`../${match[1]}`,import.meta.url));
 console.log(`✓ ${page}`);
}
for(const [key,count] of Object.entries({projects:8,services:4,blog_posts:6,team_members:4,testimonials:5,clients:8}))assert.equal(localData[key].length,count,key);
const sql=await readFile(new URL('../supabase/migrations/202610280001_initial.sql',import.meta.url),'utf8');
for(const table of ['projects','services','blog_posts','team_members','testimonials','clients','contact_messages','newsletter_subscribers'])assert.match(sql,new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
assert.doesNotMatch(sql,/GRANT SELECT ON public\.(contact_messages|newsletter_subscribers)/);
console.log('✓ bilingual sample data and RLS migration');
