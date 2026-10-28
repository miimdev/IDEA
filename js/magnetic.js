export function initMicroInteractions() {
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gsap=window.gsap;
  document.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    const target=event.target instanceof Element?event.target:null;
    const card=target?.closest('[data-tilt]');
    if(card){
      const rect=card.getBoundingClientRect();const x=event.clientX-rect.left,y=event.clientY-rect.top;
      card.style.setProperty('--x',`${x}px`);card.style.setProperty('--y',`${y}px`);
      if(gsap) gsap.to(card,{rotationX:(.5-y/rect.height)*3,rotationY:(x/rect.width-.5)*3,duration:.5,ease:'power2.out',overwrite:'auto'});
    }
    const magnetic=target?.closest('[data-magnetic]');
    if(magnetic && gsap){
      const rect=magnetic.getBoundingClientRect();
      gsap.to(magnetic,{x:(event.clientX-rect.left-rect.width/2)*.13,y:(event.clientY-rect.top-rect.height/2)*.18,duration:.5,ease:'power2.out',overwrite:'auto'});
    }
  },{passive:true});
  document.addEventListener('pointerout',event=>{
    const target=event.target instanceof Element?event.target:null;
    const card=target?.closest('[data-tilt]');
    if(card && !card.contains(event.relatedTarget) && gsap) gsap.to(card,{rotationX:0,rotationY:0,duration:.7,ease:'power3.out'});
    const magnetic=target?.closest('[data-magnetic]');
    if(magnetic && !magnetic.contains(event.relatedTarget) && gsap) gsap.to(magnetic,{x:0,y:0,duration:.8,ease:'elastic.out(1,.45)'});
  });
  document.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('.button'):null;
    if(!button || event.detail===0) return;
    const ripple=document.createElement('span');ripple.className='button-ripple';
    const rect=button.getBoundingClientRect();ripple.style.left=`${event.clientX-rect.left}px`;ripple.style.top=`${event.clientY-rect.top}px`;
    button.append(ripple);setTimeout(()=>ripple.remove(),650);
  });
}
