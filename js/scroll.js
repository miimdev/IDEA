export function initScroll() {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=document.querySelector('.site-header');
  const progress=document.querySelector('.scroll-progress');
  const gsap=window.gsap, trigger=window.ScrollTrigger;
  if (gsap && trigger) gsap.registerPlugin(trigger);
  let lenis=null;
  if (!reduced && window.Lenis) {
    lenis=new window.Lenis({lerp:.09, smoothWheel:true, syncTouch:false});
    if (gsap && trigger) {
      lenis.on('scroll',trigger.update);
      gsap.ticker.add(time=>lenis.raf(time*1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf=time=>{lenis.raf(time);requestAnimationFrame(raf)};
      requestAnimationFrame(raf);
    }
  }
  let last=window.scrollY, ticking=false;
  const update=()=>{
    const y=window.scrollY;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(progress) progress.style.transform=`scaleX(${Math.min(1,Math.max(0,y/max))})`;
    if(header){
      header.classList.toggle('is-scrolled',y>24);
      if(!header.classList.contains('menu-open') && !header.contains(document.activeElement)) {
        if (Math.abs(y-last)>3) header.classList.toggle('is-hidden',y>160 && y>last);
      }
    }
    last=y;ticking=false;
  };
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});
  header?.addEventListener('focusin',()=>header.classList.remove('is-hidden'));
  update();
  return {lenis,refresh(){trigger?.refresh();},destroy(){lenis?.destroy();}};
}

/* Tie ambient loops to scroll velocity without animating layout properties. */
export function initVelocityMotion() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let previous=scrollY,resetTimer;
  const setRate=rate=>document.querySelectorAll('.marquee-inner,.hero-ring').forEach(el=>{
    el.getAnimations().filter(a=>a.animationName==='marquee'||a.animationName==='orbit').forEach(animation=>{
      if(typeof animation.updatePlaybackRate==='function')animation.updatePlaybackRate(rate);else animation.playbackRate=rate;
    });
  });
  addEventListener('scroll',()=>{
    const delta=scrollY-previous;previous=scrollY;if(Math.abs(delta)<1)return;
    setRate(Math.sign(delta)*(1+Math.min(2,Math.abs(delta)/45)));
    clearTimeout(resetTimer);resetTimer=setTimeout(()=>setRate(1),260);
  },{passive:true});
}
