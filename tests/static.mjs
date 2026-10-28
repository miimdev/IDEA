import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {localData} from '../js/data.js';
const pages=['index.html','services.html','work.html','project.html','about.html','blog.html','contact.html','404.html'];
for(const page of pages){
 const html=await readFile(new URL(`../${page}`,import.meta.url),'utf8');
 for(const pattern of [/lang="fa"/,/dir="rtl"/,/<main id="main">/,/data-site-header/,/data-site-footer/,/rel="canonical"/,/hreflang="en"/,/application\/ld\+json/]) assert.match(html,pattern,`${page}: ${pattern}`);
 for(const match of html.matchAll(/(?:src|href)="((?:assets|css|js)\/[^"?#]+)"/g)) await access(new URL(`../${match[1]}`,import.meta.url));
 console.log(`✓ ${page}`);
}
for(const [key,count] of Object.entries({projects:8,services:4,blog_posts:6,team_members:4,testimonials:5,clients:8}))assert.equal(localData[key].length,count,key);
assert.equal(new Set(localData.projects.map(project=>project.cover)).size,8,'each project has its own cover');
for(const item of [...localData.projects,...localData.blog_posts]){
 for(const image of [item.cover,...(item.images||[])]) await access(new URL(`../${image}`,import.meta.url));
}
await access(new URL('../assets/studio.webp',import.meta.url));
const sql=await readFile(new URL('../supabase/migrations/202610280001_initial.sql',import.meta.url),'utf8');
for(const table of ['projects','services','blog_posts','team_members','testimonials','clients','contact_messages','newsletter_subscribers'])assert.match(sql,new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
assert.doesNotMatch(sql,/GRANT SELECT ON public\.(contact_messages|newsletter_subscribers)/);
const refresh=await readFile(new URL('../supabase/migrations/20261028122349_refresh_sample_art.sql',import.meta.url),'utf8');
assert.match(refresh,/p\.cover = v\.old_cover AND p\.images = v\.old_images/);
// A requestAnimationFrame timestamp may precede performance.now() on its first frame.
const number={textContent:''},percentage={textContent:''},frames=[];
const loader={setAttribute(){},querySelector(selector){return selector==='.preloader-number'?number:percentage;},classList:{add(){}},remove(){}};
const preloader=await readFile(new URL('../js/preloader.js',import.meta.url),'utf8');
runInNewContext(preloader,{window:{},document:{createElement:()=>loader,body:{append(){}}},matchMedia:()=>({matches:false}),sessionStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>1000},requestAnimationFrame:callback=>frames.push(callback),setTimeout(){}});
frames.shift()(500);assert.equal(number.textContent,'00');assert.equal(percentage.textContent,0);
frames.shift()(1650);assert.equal(number.textContent,'100');assert.equal(percentage.textContent,100);
console.log('✓ bilingual sample data, artwork, preloader and guarded RLS migrations');
