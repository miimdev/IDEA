/* Optional: install Playwright in a development environment and serve this directory over HTTP. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://localhost:8000/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
// Keep layout tests deterministic; backend integration is checked separately.
await page.route('**/*.supabase.co/rest/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
for(const width of [320,375,768,1024,1440,1920]){
 await page.setViewportSize({width,height:900});
 for(const lang of ['fa','en'])for(const path of ['index.html','services.html','work.html','about.html','blog.html','contact.html']){
  await page.goto(new URL(`${path}?lang=${lang}`,base).href,{waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px ${lang} ${path}`);
 }
}
await page.goto(new URL('work.html?lang=fa',base).href);
await page.locator('[data-filter="branding"]').click();
assert.equal(await page.locator('.work-grid .work-card:visible').count(),3);
await page.locator('[data-language-toggle]').click();
assert.equal(await page.evaluate(()=>document.dir),'ltr');
await browser.close();console.log('✓ viewport, language and filtering checks');
