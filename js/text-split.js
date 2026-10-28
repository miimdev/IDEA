/* A tiny accessible word splitter; no paid SplitText dependency. */
export function splitText(scope=document) {
  scope.querySelectorAll('[data-split]').forEach(element => {
    const text=element.textContent.trim();
    if (!text) return;
    element.removeAttribute('aria-label');
    element.textContent='';
    const accessible=document.createElement('span');accessible.className='sr-only';accessible.textContent=text;element.append(accessible);
    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) { element.append(document.createTextNode(part)); return; }
      const clip=document.createElement('span');
      const word=document.createElement('span');
      clip.className='word-clip'; word.className='word';
      clip.setAttribute('aria-hidden','true'); word.textContent=part;
      clip.append(word); element.append(clip);
    });
  });
}
export function revealSplit(scope=document) {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words=scope.querySelectorAll('.word');
  if (!words.length) return;
  window.gsap.fromTo(words,{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:1.05,stagger:.07,ease:'power4.out',clearProps:'transform,opacity'});
}
