/* Tiny synchronous bootstrap: the one-time loader starts while the rest of the page streams in. */
(() => {
  const done=Promise.resolve();
  window.__preloaderDone=done;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  try {if(sessionStorage.getItem('idea-loaded'))return;sessionStorage.setItem('idea-loaded','1');} catch {}
  const loader=document.createElement('div');loader.className='preloader';loader.setAttribute('aria-hidden','true');
  loader.innerHTML='<div class="preloader-content"><svg class="preloader-logo" viewBox="0 0 48 52"><path d="M24 2 45 14v24L24 50 3 38V14zM3 14l21 12 21-12M24 26v24"/></svg><span class="preloader-number">00</span><span class="preloader-count">IDEAS INTO IMPACT / <span>0</span>%</span></div>';
  document.body.append(loader);
  window.__preloaderDone=new Promise(resolve=>{
    const number=loader.querySelector('.preloader-number'),percentage=loader.querySelector('.preloader-count span'),start=performance.now();
    function tick(now){const progress=Math.max(0,Math.min(1,(now-start)/650)),value=Math.round((1-Math.pow(1-progress,2))*100);number.textContent=String(value).padStart(2,'0');percentage.textContent=value;if(progress<1)requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    setTimeout(()=>{loader.classList.add('is-done');resolve();setTimeout(()=>loader.remove(),750)},750);
  });
})();
