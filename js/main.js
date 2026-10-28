import { CONFIG } from './config.js';
import { localData, localized, categoryLabel } from './data.js';
import { readCollection, insertRecord, isConfigured } from './supabase.js';
import { t, getLanguage, applyTranslations, setLanguage } from './i18n.js';
import { initScroll } from './scroll.js';
import { initCursor } from './cursor.js';
import { initTransitions } from './transitions.js';
import { splitText, revealSplit } from './text-split.js';
import { initMicroInteractions } from './magnetic.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const catalog={...localData};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeImage=value=>{
  try{const u=new URL(value,location.href);return (u.origin===location.origin || u.protocol==='https:')?esc(u.href):'assets/hero-art.webp';}catch{return 'assets/hero-art.webp';}
};
const arrow='<svg class="icon arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const mark='<svg class="brand-mark" viewBox="0 0 48 52" aria-hidden="true"><defs><linearGradient id="brand-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c8b9ff"/><stop offset="1" stop-color="#7845d8"/></linearGradient></defs><path fill="none" stroke="url(#brand-gradient)" stroke-width="2" d="M24 2 45 14v24L24 50 3 38V14zM3 14l21 12 21-12M24 26v24"/><path fill="url(#brand-gradient)" d="m24 12 10 6v12l-10 6-10-6V18z"/></svg>';
const icons={
 content:'<path d="M4 20h16M6 16l1-4L17 2l4 4L11 16l-5 1Z"/><path d="m14 5 4 4M6 20v-4"/>',
 mobile:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/>',
 web:'<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M3 8h18M6 6h.01M9 6h.01M9 12l-2 2 2 2m6-4 2 2-2 2"/>',
 branding:'<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5"/>',
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.branding}</svg>`;
const brand=()=>`<a class="brand" href="index.html" aria-label="Idehpardazan home">${mark}<span class="brand-copy"><span class="brand-name" data-i18n="brand">ایده‌پردازان</span><span class="brand-sub" data-i18n="brandSub">آژانس خلاقیت</span></span></a>`;
const links=[['home','index.html'],['services','services.html'],['work','work.html'],['about','about.html'],['blog','blog.html']];
const currentPage=()=>({project:'work','not-found':''}[document.body.dataset.page] ?? document.body.dataset.page);
function injectChrome(){
  const header=document.querySelector('[data-site-header]');
  const footer=document.querySelector('[data-site-footer]');
  const nav=(mobile=false)=>links.map(([key,href],i)=>`<a href="${href}" class="${mobile?'':'nav-link'}" ${currentPage()===key?'aria-current="page"':''} ${mobile?`style="--i:${i}"`:''} data-i18n="${key}">${t(key)}</a>`).join('');
  if(header)header.innerHTML=`<div class="scroll-progress" aria-hidden="true"></div><header class="site-header"><div class="container header-inner">${brand()}<nav class="desktop-nav" aria-label="Primary navigation">${nav()}<span class="nav-indicator" aria-hidden="true"></span></nav><div class="header-actions"><a class="header-contact" href="contact.html"><span data-i18n="contact">تماس با ما</span>${arrow}</a><button class="lang-toggle" type="button" data-language-toggle aria-label="تغییر زبان به انگلیسی"><span data-language="fa">FA</span><span class="slash">/</span><span data-language="en">EN</span></button><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-i18n-aria="menu" aria-label="باز کردن فهرست"><span></span></button></div></div></header><div class="mobile-menu" id="mobile-menu" aria-hidden="true"><nav class="mobile-nav" aria-label="Mobile navigation">${nav(true)}<a href="contact.html" style="--i:5" data-i18n="contact">تماس با ما</a></nav><div class="mobile-menu-bottom"><span class="en-label">IDEAS INTO IMPACT<br>TEHRAN / WORLDWIDE</span><a class="text-link" href="mailto:${CONFIG.studioEmail}">${CONFIG.studioEmail} ↗</a></div></div>`;
  if(footer)footer.innerHTML=`<footer class="site-footer"><div class="container"><div class="footer-main"><div class="footer-about">${brand()}<p data-i18n="footerDesc">ما ایده‌ها را به تجربه‌های خلاقانه و ماندگار تبدیل می‌کنیم. بیایید آینده را با هم تصور کنیم.</p></div><div><h2 class="footer-heading" data-i18n="footerExplore">کشف کنید</h2><nav class="footer-links" aria-label="Footer navigation">${links.slice(1).map(([key,href])=>`<a class="link-underline" href="${href}" data-i18n="${key}">${t(key)}</a>`).join('')}<a class="link-underline" href="contact.html" data-i18n="contact">تماس با ما</a></nav></div><div class="footer-newsletter"><h2 class="footer-heading" data-i18n="footerNewsletter">نامه‌هایی از ایده‌پردازان</h2><p data-i18n="footerNewsletterDesc">گاهی از ایده‌ها، طراحی و چیزهایی که دوست داریم برایتان می‌نویسیم.</p><form class="newsletter-form" data-newsletter-form novalidate><label class="sr-only" for="newsletter-email" data-i18n="emailPlaceholder">آدرس ایمیل شما</label><input id="newsletter-email" type="email" name="email" inputmode="email" autocomplete="email" maxlength="254" required placeholder="آدرس ایمیل شما" data-i18n-placeholder="emailPlaceholder"><div class="honeypot" aria-hidden="true"><label for="newsletter-website">Website</label><input id="newsletter-website" name="website" tabindex="-1" autocomplete="off"></div><button type="submit" data-i18n-aria="subscribe" aria-label="عضویت در خبرنامه">${arrow}</button></form></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} <span data-i18n="footerRights">تمام حقوق برای ایده‌پردازان محفوظ است.</span></span><div class="footer-social"><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><a href="mailto:${CONFIG.studioEmail}">EMAIL ↗</a></div></div><div class="footer-watermark" aria-hidden="true">IDEHPARDAZAN®</div></div></footer>`;
}
function initHeader(){
  const header=document.querySelector('.site-header'),menu=document.querySelector('.mobile-menu'),toggle=document.querySelector('.menu-toggle');
  const closeMenu=()=>{header?.classList.remove('menu-open');menu?.classList.remove('is-open');menu?.setAttribute('aria-hidden','true');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label',t('menu'));document.documentElement.style.overflow='';};
  toggle?.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');if(!open){closeMenu();return}header.classList.add('menu-open');header.classList.remove('is-hidden');menu.classList.add('is-open');menu.setAttribute('aria-hidden','false');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label',t('closeMenu'));document.documentElement.style.overflow='hidden';});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menu?.classList.contains('is-open')){closeMenu();toggle?.focus()}
    if(e.key==='Tab'&&menu?.classList.contains('is-open')){
      const focusable=[toggle,...menu.querySelectorAll('a,button')];const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.querySelector('[data-language-toggle]')?.addEventListener('click',()=>{
    const next=getLanguage()==='fa'?'en':'fa';
    if(document.startViewTransition&&!reduced) document.startViewTransition(()=>setLanguage(next)); else setLanguage(next);
    if(menu?.classList.contains('is-open'))toggle.setAttribute('aria-label',t('closeMenu'));
  });
  const nav=document.querySelector('.desktop-nav'),indicator=nav?.querySelector('.nav-indicator');
  const moveIndicator=el=>{if(!el||!indicator)return;const r=el.getBoundingClientRect(),p=nav.getBoundingClientRect();indicator.style.width=`${r.width}px`;indicator.style.transform=`translateX(${r.left-p.left}px)`;};
  const active=()=>nav?.querySelector('[aria-current="page"]');
  nav?.querySelectorAll('.nav-link').forEach(el=>el.addEventListener('mouseenter',()=>moveIndicator(el)));
  nav?.addEventListener('mouseleave',()=>moveIndicator(active()));
  addEventListener('resize',()=>moveIndicator(active()),{passive:true});
  addEventListener('languagechange',()=>requestAnimationFrame(()=>moveIndicator(active())));
  requestAnimationFrame(()=>moveIndicator(active()));
}
function startPreloader(){
  if(reduced)return Promise.resolve();
  try {if(sessionStorage.getItem('idea-loaded'))return Promise.resolve();sessionStorage.setItem('idea-loaded','1');}catch{}
  return new Promise(resolve=>{
    const loader=document.createElement('div');loader.className='preloader';loader.setAttribute('aria-hidden','true');
    loader.innerHTML=`<div class="preloader-content"><svg class="preloader-logo" viewBox="0 0 48 52"><path d="M24 2 45 14v24L24 50 3 38V14zM3 14l21 12 21-12M24 26v24"/></svg><span class="preloader-number">00</span><span class="preloader-count">IDEAS INTO IMPACT / <span>0</span>%</span></div>`;
    document.body.append(loader);const n=loader.querySelector('.preloader-number'),small=loader.querySelector('.preloader-count span');const start=performance.now(),duration=1100;
    function tick(now){const progress=Math.min(1,(now-start)/duration);const count=Math.round((1-Math.pow(1-progress,2))*100);n.textContent=String(count).padStart(2,'0');small.textContent=count;if(progress<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);
    setTimeout(()=>{loader.classList.add('is-done');resolve();setTimeout(()=>loader.remove(),1000)},1200);
  });
}
function projectCard(project){
  const lang=getLanguage(),title=localized(project,'title',lang),summary=localized(project,'summary',lang);
  return `<article class="work-card" data-category="${esc(project.category)}"><a href="project.html?slug=${encodeURIComponent(project.slug)}" data-cursor="view" aria-label="${esc(title)}"><div class="work-card-image"><img src="${safeImage(project.cover)}" width="1024" height="1024" loading="lazy" decoding="async" alt="${esc(title)}"><span class="work-overlay">${arrow}</span></div><div class="work-card-meta"><div><h3>${esc(title)}</h3><p>${esc(summary)}</p></div><span class="work-card-year">${esc(project.year)}</span></div></a></article>`;
}
function serviceCard(item,index){
  return `<article class="service-card" data-tilt><div class="service-top"><span class="service-icon">${icon(item.icon)}</span><span class="card-number">${String(index+1).padStart(2,'0')}</span></div><h3>${esc(localized(item,'title'))}</h3><p>${esc(localized(item,'description'))}</p><a class="text-link" href="services.html#${encodeURIComponent(item.slug)}"><span>${esc(t('details'))}</span>${arrow}</a></article>`;
}
function renderHome(){
  const services=document.querySelector('[data-home-services]'),featured=document.querySelector('[data-featured-work]');
  if(services)services.innerHTML=catalog.services.slice(0,4).map(serviceCard).join('');
  if(featured)featured.innerHTML=catalog.projects.filter(p=>p.featured).slice(0,4).map(projectCard).join('');
  const clients=document.querySelector('[data-clients]');if(clients)clients.innerHTML=catalog.clients.map(c=>`<span class="client-logo">${esc(c.name)}</span>`).join('');
  const testimonials=document.querySelector('[data-testimonials]');
  if(testimonials)testimonials.innerHTML=catalog.testimonials.map(item=>`<article class="testimonial-card" lang="${getLanguage()}"><div class="quote-mark" aria-hidden="true">“</div><blockquote>${esc(localized(item,'quote'))}</blockquote><div class="testimonial-person"><div class="testimonial-avatar" aria-hidden="true">${esc(item.initials||'IP')}</div><div><strong>${esc(localized(item,'name'))}</strong><span>${esc(localized(item,'role'))}</span></div></div></article>`).join('');
}
function renderServices(){
 const list=document.querySelector('[data-services-list]');if(!list)return;
 list.innerHTML=catalog.services.map((s,i)=>`<article class="service-detail" id="${esc(s.slug)}"><div class="service-detail-copy"><span class="service-detail-number">${String(i+1).padStart(2,'0')} / 04</span><h2>${esc(localized(s,'title'))}</h2><p>${esc(localized(s,'detail')||localized(s,'description'))}</p></div><div class="service-detail-side"><div class="service-detail-art"><span class="service-icon">${icon(s.icon)}</span></div><h3>${esc(t('capabilities'))}</h3><div class="capabilities">${(localized(s,'capabilities')||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><h3>${esc(t('technologies'))}</h3><div class="capabilities">${(s.technologies||[]).map(x=>`<span class="tag" dir="ltr">${esc(x)}</span>`).join('')}</div></div></article>`).join('');
}
let selectedFilter='all';
function renderWork(){
 const grid=document.querySelector('[data-work-grid]');if(!grid)return;
 grid.innerHTML=catalog.projects.map(projectCard).join('');
 document.querySelectorAll('[data-filter]').forEach(button=>{button.textContent=categoryLabel(button.dataset.filter);const on=button.dataset.filter===selectedFilter;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
 grid.querySelectorAll('.work-card').forEach(card=>card.hidden=selectedFilter!=='all'&&card.dataset.category!==selectedFilter);
}
function renderProject(){
 const mount=document.querySelector('[data-project-detail]');if(!mount)return;
 const slug=new URLSearchParams(location.search).get('slug');const project=catalog.projects.find(p=>p.slug===slug);
 if(!project){mount.innerHTML=`<div class="page-hero"><span class="eyebrow">${esc(t('workEyebrow'))}</span><h1>${esc(t('projectMissing'))}</h1><p><a class="text-link" href="work.html">${arrow}<span>${esc(t('projectBack'))}</span></a></p></div>`;return;}
 const i=catalog.projects.indexOf(project),next=catalog.projects[(i+1)%catalog.projects.length],title=localized(project,'title');
 document.title=`${title} | ${getLanguage()==='fa'?'ایده‌پردازان':'Idehpardazan'}`;
 const gallery=(Array.isArray(project.images)&&project.images.length?project.images:[project.cover]).slice(0,4);
 mount.innerHTML=`<div class="project-topline"><a class="text-link" href="work.html">${arrow}<span>${esc(t('projectBack'))}</span></a><span class="en-label">SELECTED WORK / ${String(i+1).padStart(2,'0')}</span></div><span class="eyebrow">${esc(categoryLabel(project.category))}</span><h1 data-split>${esc(title)}</h1><p class="project-lead">${esc(localized(project,'summary'))}</p><img class="project-cover" src="${safeImage(project.cover)}" width="1200" height="800" alt="${esc(title)}"><div class="project-details"><dl class="project-info"><div><dt>${esc(t('projectClient'))}</dt><dd>${esc(localized(project,'client'))}</dd></div><div><dt>${esc(t('projectYear'))}</dt><dd>${esc(project.year)}</dd></div><div><dt>${esc(t('projectService'))}</dt><dd>${esc(categoryLabel(project.category))}</dd></div><div><dt>${esc(t('projectTech'))}</dt><dd>${esc((project.technologies||[]).join(' · '))}</dd></div></dl><div class="project-story"><span class="eyebrow">${esc(t('projectStory'))}</span><h2>${esc(localized(project,'summary'))}</h2><p>${esc(localized(project,'description'))}</p></div></div><div class="project-gallery">${gallery.map((img,n)=>`<img src="${safeImage(img)}" width="1000" height="800" loading="lazy" alt="${esc(title)} — ${n+1}">`).join('')}</div><a class="project-next" href="project.html?slug=${encodeURIComponent(next.slug)}" data-drag-next><div><span class="eyebrow">${esc(t('projectNext'))}</span><h2>${esc(localized(next,'title'))}</h2></div><span class="button button--round" aria-hidden="true">${arrow}</span></a>`;
}
function renderTeam(){const team=document.querySelector('[data-team]');if(team)team.innerHTML=catalog.team_members.map(member=>`<article class="team-card"><div class="team-portrait" style="--team-color:${/^#[0-9a-f]{3,8}$/i.test(member.color||'')?member.color:'#705297'}" aria-hidden="true"></div><h3>${esc(localized(member,'name'))}</h3><p>${esc(localized(member,'role'))}</p></article>`).join('');}
function blogCard(post){return `<article class="blog-card"><a href="blog.html?slug=${encodeURIComponent(post.slug)}"><div class="blog-cover"><img src="${safeImage(post.cover)}" width="1024" height="1024" loading="lazy" alt=""></div><div class="blog-card-copy"><div class="blog-card-meta"><span>${esc(localized(post,'category'))}</span><span>${esc(post.read_minutes)} ${esc(t('readTime'))}</span></div><h2>${esc(localized(post,'title'))}</h2><p>${esc(localized(post,'excerpt'))}</p></div></a></article>`;}
function renderBlog(){
 const grid=document.querySelector('[data-blog-grid]'),list=document.querySelector('[data-blog-list]'),article=document.querySelector('[data-blog-article]');if(!grid||!list||!article)return;
 const slug=new URLSearchParams(location.search).get('slug');
 if(!slug){list.hidden=false;article.hidden=true;grid.innerHTML=catalog.blog_posts.map(blogCard).join('');document.querySelector('.article-progress')?.remove();return;}
 list.hidden=true;article.hidden=false;const post=catalog.blog_posts.find(p=>p.slug===slug);
 if(!post){article.innerHTML=`<div class="page-hero container"><h1>${esc(t('articleMissing'))}</h1><p><a href="blog.html" class="text-link">${esc(t('backBlog'))} ${arrow}</a></p></div>`;return;}
 document.title=`${localized(post,'title')} | ${getLanguage()==='fa'?'ایده‌پردازان':'Idehpardazan'}`;
 const date=new Date(post.published_at);const dateText=Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat(getLanguage()==='fa'?'fa-IR':'en',{year:'numeric',month:'long',day:'numeric'}).format(date);
 const body=String(localized(post,'body')).split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('');
 article.innerHTML=`<article class="article page-hero container"><a class="text-link" href="blog.html">${arrow}<span>${esc(t('backBlog'))}</span></a><div style="margin-top:45px"><span class="eyebrow">${esc(localized(post,'category'))}</span><h1>${esc(localized(post,'title'))}</h1><div class="article-meta">${esc(dateText)} &nbsp; · &nbsp; ${esc(post.read_minutes)} ${esc(t('readTime'))}</div><img class="article-cover" src="${safeImage(post.cover)}" width="1000" height="700" alt=""><div class="article-body">${body}</div></div></article>`;
 if(!document.querySelector('.article-progress')){const progress=document.createElement('div');progress.className='article-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress)}
}
function renderPage(){renderHome();renderServices();renderWork();renderProject();renderTeam();renderBlog();translateSelectOptions();}
function translateSelectOptions(){const select=document.querySelector('#project-type');if(!select)return;const labels={branding:categoryLabel('branding'),web:categoryLabel('web'),mobile:categoryLabel('mobile'),content:categoryLabel('content'),other:getLanguage()==='fa'?'سایر':'Other'};[...select.options].forEach(o=>{if(labels[o.value])o.textContent=labels[o.value]});}
function toast(message){const region=document.querySelector('.toast-region');if(!region)return;const item=document.createElement('div');item.className='toast';item.textContent=message;region.append(item);setTimeout(()=>item.remove(),5500);}
function validEmail(value){return value.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
function initForms(){
 document.addEventListener('submit',async event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement))return;
  if(form.matches('[data-newsletter-form]')){
    event.preventDefault();const data=new FormData(form),email=String(data.get('email')||'').trim();
    if(!validEmail(email)){toast(t('emailError'));form.querySelector('input[type=email]')?.focus();return}
    if(data.get('website')){form.reset();toast(t('newsletterSuccess'));return}
    const button=form.querySelector('button');button.disabled=true;
    try{await insertRecord('newsletter_subscribers',{email});form.reset();toast(t('newsletterSuccess'));}catch{toast(t('newsletterError'));}finally{button.disabled=false;}
  }
  if(form.matches('[data-contact-form]')){
    event.preventDefault();const data=new FormData(form);
    const values={name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),project_type:String(data.get('project_type')||'').trim(),budget:String(data.get('budget')||'').trim(),message:String(data.get('message')||'').trim()};
    const errors={};if(values.name.length<2)errors.name=t('requiredError');else if(values.name.length>120)errors.name=t('lengthError');
    if(!validEmail(values.email))errors.email=t('emailError');if(!values.project_type)errors.project_type=t('requiredError');
    if(values.message.length<10)errors.message=t('requiredError');else if(values.message.length>5000)errors.message=t('lengthError');
    ['name','email','project_type','budget','message'].forEach(key=>{const field=form.elements.namedItem(key),error=form.querySelector(`#error-${key}`);if(field)field.setAttribute('aria-invalid',String(!!errors[key]));if(error)error.textContent=errors[key]||'';});
    if(Object.keys(errors).length){form.elements.namedItem(Object.keys(errors)[0])?.focus();return}
    const success=()=>{form.innerHTML=`<div class="form-success" role="status"><div class="confetti-wrap"></div><svg class="success-check" viewBox="0 0 55 55" aria-hidden="true"><circle cx="27.5" cy="27.5" r="25" opacity=".4"/><path d="M15 28l8 8 17-19"/></svg><h3>${esc(t('formSuccess'))}</h3><p>${esc(t('formSuccessDesc'))}</p></div>`;if(!reduced){const wrap=form.querySelector('.confetti-wrap');for(let i=0;i<18;i++){const piece=document.createElement('i');piece.className='confetti-piece';piece.style.setProperty('--dx',`${(Math.random()-.5)*240}px`);piece.style.setProperty('--dy',`${-30-Math.random()*110}px`);piece.style.setProperty('--rot',`${Math.random()*520}deg`);piece.style.animationDelay=`${Math.random()*.15}s`;wrap.append(piece)}}};
    if(data.get('website')){success();return}
    const button=form.querySelector('button[type=submit]'),label=button.querySelector('span');button.disabled=true;label.textContent=t('formSending');
    try{await insertRecord('contact_messages',values);success();}catch{toast(t('formError'));button.disabled=false;label.textContent=t('formSubmit');}
  }
 });
}
function initFilters(){document.addEventListener('click',event=>{
 const button=event.target instanceof Element?event.target.closest('[data-filter]'):null;if(!button)return;const grid=document.querySelector('[data-work-grid]');if(!grid)return;
 const cards=[...grid.querySelectorAll('.work-card')],before=new Map(cards.filter(el=>!el.hidden).map(el=>[el,el.getBoundingClientRect()]));
 selectedFilter=button.dataset.filter;cards.forEach(card=>card.hidden=selectedFilter!=='all'&&card.dataset.category!==selectedFilter);
 document.querySelectorAll('[data-filter]').forEach(el=>{const active=el===button;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active));});
 if(!reduced)cards.filter(el=>!el.hidden).forEach(card=>{const old=before.get(card),now=card.getBoundingClientRect(),content=card.firstElementChild;if(old){const x=old.left-now.left,y=old.top-now.top;if(x||y)content.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});}else content.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'ease-out'});});
 window.ScrollTrigger?.refresh();
});}
function initTestimonials(){
 const viewport=document.querySelector('.testimonial-viewport');if(!viewport)return;let down=false,startX=0,startScroll=0,moved=false;
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=false;startX=e.clientX;startScroll=viewport.scrollLeft;viewport.classList.add('dragging');viewport.setPointerCapture(e.pointerId)});
 viewport.addEventListener('pointermove',e=>{if(!down)return;const delta=e.clientX-startX;if(Math.abs(delta)>5)moved=true;viewport.scrollLeft=startScroll-delta});
 const finish=e=>{if(!down)return;down=false;viewport.classList.remove('dragging');if(moved){const index=Math.round(viewport.scrollLeft/viewport.clientWidth);viewport.scrollTo({left:index*viewport.clientWidth,behavior:reduced?'auto':'smooth'});}try{viewport.releasePointerCapture(e.pointerId)}catch{}};
 viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);
 document.querySelector('[data-testimonial-prev]')?.addEventListener('click',()=>viewport.scrollBy({left:-viewport.clientWidth,behavior:reduced?'auto':'smooth'}));
 document.querySelector('[data-testimonial-next]')?.addEventListener('click',()=>viewport.scrollBy({left:viewport.clientWidth,behavior:reduced?'auto':'smooth'}));
}
function initCountersAndSteps(){
 if(!('IntersectionObserver'in window)) {document.querySelectorAll('.process-step').forEach(el=>el.classList.add('is-active'));return}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;
  if(el.matches('.process-step'))el.classList.add('is-active');
  if(el.matches('[data-count]')&&!reduced&&window.gsap){const target=Number(el.dataset.count),state={value:0};window.gsap.to(state,{value:target,duration:1.6,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(state.value)});}
  observer.unobserve(el);
 }),{threshold:.35});document.querySelectorAll('.process-step,[data-count]').forEach(el=>observer.observe(el));
}
let revealContext,featuredContext,scrollController;
function setupMotion(){
 revealContext?.revert();featuredContext?.revert();
 if(reduced || !window.gsap || !window.ScrollTrigger)return;
 const gsap=window.gsap;gsap.registerPlugin(window.ScrollTrigger);
 revealContext=gsap.context(()=>{
  gsap.utils.toArray('.services-grid .service-card, .section-head, .process-step, .value-card, .team-card, .blog-card, .project-gallery img').forEach((element,i)=>{
   gsap.from(element,{y:24,opacity:0,duration:.8,delay:(i%4)*.06,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
  });
 });
 const pin=document.querySelector('.featured-pin'),scroller=document.querySelector('.featured-scroll'),track=document.querySelector('.work-track');
 if(pin&&scroller&&track&&innerWidth>=1000){
  featuredContext=gsap.context(()=>{
   const distance=()=>Math.max(0,track.scrollWidth-scroller.clientWidth);
   if(distance()>20){scroller.classList.add('is-pinned');gsap.to(track,{x:()=>distance()*(document.documentElement.dir==='rtl'?1:-1),ease:'none',scrollTrigger:{trigger:pin,start:'top 110px',end:()=>`+=${distance()}`,scrub:1,pin:true,invalidateOnRefresh:true,onKill:()=>scroller.classList.remove('is-pinned')}});}
  });
 }
 requestAnimationFrame(()=>window.ScrollTrigger.refresh());
}
function initArticleProgress(){addEventListener('scroll',()=>{const progress=document.querySelector('.article-progress'),article=document.querySelector('.article-body');if(!progress||!article)return;const rect=article.getBoundingClientRect(),length=Math.max(1,article.offsetHeight-innerHeight*.5),value=Math.max(0,Math.min(1,(innerHeight*.5-rect.top)/length));progress.style.transform=`scaleX(${value})`;},{passive:true});}
function initDragNext(){let start=null;document.addEventListener('pointerdown',e=>{const next=e.target instanceof Element?e.target.closest('[data-drag-next]'):null;if(next)start={x:e.clientX,link:next};});document.addEventListener('pointerup',e=>{if(!start)return;const delta=e.clientX-start.x;if(Math.abs(delta)>80){const link=start.link;start=null;location.href=link.href;return}start=null;});}
function setMetaForLanguage(){const description=document.querySelector('meta[name="description"]')?.content;const ogTitle=document.querySelector('meta[property="og:title"]'),ogDesc=document.querySelector('meta[property="og:description"]');if(ogTitle)ogTitle.content=document.title;if(ogDesc&&description)ogDesc.content=description;}

injectChrome();applyTranslations();renderPage();splitText();initHeader();initTransitions();initCursor(()=>t('view'));initMicroInteractions();initForms();initFilters();initTestimonials();initCountersAndSteps();initArticleProgress();initDragNext();scrollController=initScroll();setupMotion();setMetaForLanguage();
startPreloader().then(()=>revealSplit(document.querySelector('.hero-copy')||document));
window.addEventListener('languagechange',()=>{renderPage();splitText();setupMotion();setMetaForLanguage();revealSplit(document.querySelector('.hero-copy')||document);scrollController?.refresh();});
if(document.body.dataset.page==='home')import('./hero3d.js').then(m=>m.initHero3D()).catch(()=>{});
if(isConfigured()){
 Promise.all(Object.keys(localData).map(async key=>[key,await readCollection(key)])).then(results=>{
  let changed=false;results.forEach(([key,items])=>{if(items&&items.length){catalog[key]=items;changed=true;}});
  if(changed){renderPage();splitText();setupMotion();setMetaForLanguage();scrollController?.refresh();}
 });
}
