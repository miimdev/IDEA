export function initCursor(getLabel) {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dot=document.createElement('div'),ring=document.createElement('div');
  dot.className='cursor-dot';ring.className='cursor-ring';
  dot.setAttribute('aria-hidden','true');ring.setAttribute('aria-hidden','true');
  document.body.append(dot,ring);
  let x=-100,y=-100,rx=-100,ry=-100,active=false;
  const render=()=>{
    if(active){rx+=(x-rx)*.16;ry+=(y-ry)*.16;dot.style.left=`${x}px`;dot.style.top=`${y}px`;ring.style.left=`${rx}px`;ring.style.top=`${ry}px`;}
    requestAnimationFrame(render);
  };requestAnimationFrame(render);
  addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse') return;
    x=event.clientX;y=event.clientY;active=true;dot.style.opacity='1';ring.style.opacity='1';
    const target=event.target instanceof Element?event.target:null;
    const isInput=!!target?.closest('input,textarea,select');
    const view=!!target?.closest('[data-cursor="view"]');
    const hover=!!target?.closest('a,button,[data-magnetic]');
    ring.classList.toggle('is-input',isInput);ring.classList.toggle('is-view',view);ring.classList.toggle('is-hover',hover&&!view&&!isInput);
    ring.textContent=view?getLabel():'';
  },{passive:true});
  document.addEventListener('pointerleave',()=>{active=false;dot.style.opacity='0';ring.style.opacity='0';});
}
