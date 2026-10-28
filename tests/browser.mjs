/* Optional: install Playwright in a development environment and serve this directory over HTTP. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {localData} from '../js/data.js';
const base=process.env.BASE_URL||'http://localhost:8000/';
const options={headless:true};
if(process.env.CHROMIUM_PATH) options.executablePath=process.env.CHROMIUM_PATH;
if(process.env.CHROMIUM_ARGS) options.args=JSON.parse(process.env.CHROMIUM_ARGS);
const browser=await chromium.launch(options);
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
// Exercise the post-fetch re-render without depending on an external backend.
await page.route('**/*.supabase.co/rest/v1/**',route=>{
 const table=new URL(route.request().url()).pathname.split('/').pop();
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(localData[table]||[])});
});
for(const width of [320,375,768,1024,1440,1920]){
 await page.setViewportSize({width,height:900});
 for(const lang of ['fa','en'])for(const path of ['index.html','services.html','work.html','about.html','blog.html','contact.html']){
  await page.goto(new URL(`${path}?lang=${lang}`,base).href,{waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px ${lang} ${path}`);
 }
}
await page.setViewportSize({width:1440,height:900});
await page.goto(new URL('index.html?lang=fa',base).href);
await page.waitForTimeout(1300);
for(const line of await page.locator('.hero-line').all()){
 const source=await line.locator('.sr-only').textContent();
 const words=await line.locator('.word').allTextContents();
 assert.equal(words.join(' '),source,'split text remains stable after remote re-render');
}
await page.goto(new URL('work.html?lang=fa',base).href);
await page.waitForTimeout(1300);
assert.equal(new Set(await page.locator('.work-grid img').evaluateAll(images=>images.map(image=>image.src))).size,8);
await page.locator('[data-filter="branding"]').click();
assert.equal(await page.locator('.work-grid .work-card:visible').count(),3);
await page.locator('[data-language-toggle]').click();
assert.equal(await page.evaluate(()=>document.dir),'ltr');
assert.deepEqual(errors,[],'no uncaught page errors');
await browser.close();console.log('✓ viewport, language, unique artwork, remote re-render and filtering checks');
