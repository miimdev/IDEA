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
