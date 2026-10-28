/* Small, transform-only accents on top of the fully usable static artwork. */
export function initExperience(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap)return;
  const gsap=window.gsap;
  const hero=document.querySelector('.hero-visual');
  const scene=hero?.querySelector('.hero-scene');
  if(hero && scene && matchMedia('(hover: hover) and (pointer: fine)').matches){
    const x=gsap.quickTo(scene,'x',{duration:1.1,ease:'power3.out'});
    const y=gsap.quickTo(scene,'y',{duration:1.1,ease:'power3.out'});
    const rotate=gsap.quickTo(scene,'rotation',{duration:1.3,ease:'power3.out'});
    hero.addEventListener('pointermove',event=>{
      const bounds=hero.getBoundingClientRect();
      const dx=(event.clientX-bounds.left)/bounds.width-.5;
      const dy=(event.clientY-bounds.top)/bounds.height-.5;
      x(dx*16);y(dy*12);rotate(dx*1.8);
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{x(0);y(0);rotate(0);},{passive:true});
  }
  if(!window.ScrollTrigger)return;
  gsap.registerPlugin(window.ScrollTrigger);
  document.querySelectorAll('.studio-feature-media, .studio-banner-media').forEach(frame=>{
    const image=frame.querySelector('img');if(!image)return;
    gsap.fromTo(image,{scale:1.1},{scale:1,ease:'none',scrollTrigger:{trigger:frame,start:'top bottom',end:'bottom top',scrub:1}});
  });
}
