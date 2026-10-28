export function initTransitions() {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;
  const curtain=document.createElement('div');curtain.className='page-curtain';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
  let arrived=false;
  try{arrived=sessionStorage.getItem('idea-transition')==='1';sessionStorage.removeItem('idea-transition');}catch{}
  if(arrived){curtain.style.transition='none';curtain.classList.add('is-covering');requestAnimationFrame(()=>requestAnimationFrame(()=>{curtain.style.transition='';curtain.classList.remove('is-covering');curtain.classList.add('is-leaving');setTimeout(()=>curtain.classList.remove('is-leaving'),700);}));}
  let navigating=false;
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || navigating)return;
    const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;
    if(!anchor || anchor.target || anchor.hasAttribute('download') || anchor.hasAttribute('data-no-transition'))return;
    const destination=new URL(anchor.href,location.href);
    if(destination.origin!==location.origin || !/^https?:$/.test(destination.protocol))return;
    if(destination.pathname===location.pathname && destination.search===location.search) return;
    if(destination.hash && destination.pathname===location.pathname && destination.search===location.search)return;
    event.preventDefault();navigating=true;
    try{sessionStorage.setItem('idea-transition','1')}catch{}
    curtain.classList.add('is-covering');
    setTimeout(()=>{location.href=destination.href},570);
  });
}
