/* The artwork remains visible as a zero-WebGL / reduced-motion fallback. */
export async function initHero3D() {
  const canvas=document.querySelector('.hero-canvas'), container=document.querySelector('.hero-visual');
  if(!canvas||!container || matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.deviceMemory && navigator.deviceMemory<=2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2)) return;
  // Probe before constructing a renderer so unsupported devices fall back silently.
  try { const probe=document.createElement('canvas'); if(!probe.getContext('webgl2') && !probe.getContext('webgl')) return; } catch { return; }
  let THREE;
  try { THREE=await import('../assets/vendor/three.module.js'); }
  catch { try { THREE=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'); } catch { return; } }
  let renderer;
  try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'}); } catch { return; }
  canvas.dataset.webglReady='true';
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(0,0,8.8);
  scene.add(new THREE.AmbientLight(0xb9a7ff,1.3));
  const light=new THREE.DirectionalLight(0xe0caff,3);light.position.set(-4,5,5);scene.add(light);
  const violet=new THREE.PointLight(0x8b5cf6,32,25);violet.position.set(3,-1,3);scene.add(violet);
  // A tiny generated studio environment gives the physical glass reflective panels without a network request.
  const envCanvas=document.createElement('canvas');envCanvas.width=512;envCanvas.height=256;
  const ctx=envCanvas.getContext('2d');
  if(ctx){
    ctx.fillStyle='#151020';ctx.fillRect(0,0,512,256);
    const glow=ctx.createRadialGradient(310,100,1,310,100,150);glow.addColorStop(0,'#e6ddff');glow.addColorStop(.14,'#9964ff');glow.addColorStop(1,'#171020');ctx.fillStyle=glow;ctx.fillRect(0,0,512,256);
    ctx.fillStyle='#e1d3ff';ctx.fillRect(80,35,28,120);ctx.fillRect(410,10,9,160);
    const texture=new THREE.CanvasTexture(envCanvas);texture.mapping=THREE.EquirectangularReflectionMapping;
    try{const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(texture).texture;texture.dispose();pmrem.dispose();}catch{}
  }
  const group=new THREE.Group();scene.add(group);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.6,1.6),new THREE.MeshPhysicalMaterial({color:0x9c76ef,metalness:.08,roughness:.08,transmission:.72,thickness:1.1,ior:1.45,transparent:true,opacity:.30,envMapIntensity:1.5}));
  glass.rotation.set(.38,.72,.03);group.add(glass);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry),new THREE.LineBasicMaterial({color:0xd5c4ff,transparent:true,opacity:.25}));glass.add(edges);
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.34,32,24),new THREE.MeshPhysicalMaterial({color:0x5420a4,metalness:.8,roughness:.12,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.3}));sphere.position.set(1.05,-.67,.3);group.add(sphere);
  const rockGeometry=new THREE.IcosahedronGeometry(.37,1);const positions=rockGeometry.attributes.position;
  for(let i=0;i<positions.count;i++){const f=.83+Math.abs(Math.sin(i*12.9898))* .27;positions.setXYZ(i,positions.getX(i)*f,positions.getY(i)*f,positions.getZ(i)*f)}rockGeometry.computeVertexNormals();
  const rock=new THREE.Mesh(rockGeometry,new THREE.MeshStandardMaterial({color:0x191224,roughness:1,flatShading:true,transparent:true,opacity:.35}));rock.position.set(1.52,-.12,-.05);group.add(rock);
  const particles=new Float32Array(90*3);for(let i=0;i<particles.length;i+=3){particles[i]=(Math.random()-.5)*7;particles[i+1]=(Math.random()-.5)*5;particles[i+2]=(Math.random()-.5)*3}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(particles,3));
  const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xbfa9ff,size:.022,transparent:true,opacity:.55}));scene.add(points);
  let targetX=0,targetY=0,visible=true,frame=0,raf=0,elapsed=0;
  const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
  new ResizeObserver(resize).observe(container);resize();
  const move=e=>{targetX=(e.clientX/innerWidth-.5)*.28;targetY=(e.clientY/innerHeight-.5)*.2};
  addEventListener('pointermove',move,{passive:true});
  addEventListener('deviceorientation',e=>{if(e.gamma!=null&&e.beta!=null){targetX=Math.max(-.3,Math.min(.3,e.gamma/100));targetY=Math.max(-.2,Math.min(.2,(e.beta-45)/160))}},{passive:true});
  function render(time){
    if(!visible||document.hidden){raf=0;return}
    raf=requestAnimationFrame(render);
    if(time-frame<24)return;frame=time;elapsed=time*.001;
    const scroll=Math.max(0,Math.min(1,window.scrollY/Math.max(1,innerHeight)));
    group.rotation.y+=(targetX+scroll*.23-group.rotation.y)*.045;group.rotation.x+=(targetY-group.rotation.x)*.045;
    group.position.y=Math.sin(elapsed*.75)*.06;group.scale.setScalar(1-scroll*.18);
    glass.rotation.y+=.0017; sphere.position.y=-.67+Math.sin(elapsed*1.1)*.045;rock.rotation.y+=.002;
    points.rotation.y=elapsed*.012;renderer.render(scene,camera);
  }
  const resume=()=>{if(visible&&!document.hidden&&!raf)raf=requestAnimationFrame(render)};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.01});observer.observe(container);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else resume()});
  resume();
}
