const root=document.documentElement;
const story=document.querySelector('.story');
const nav=document.getElementById('nav');

function updateStory(){
  const rect=story.getBoundingClientRect();
  const total=story.offsetHeight-window.innerHeight;
  const raw=Math.min(1,Math.max(0,-rect.top/Math.max(1,total)));
  // Smoothstep makes the motion feel less mechanical.
  const p=raw*raw*(3-2*raw);
  root.style.setProperty('--p',p.toFixed(4));
  nav.classList.toggle('scrolled',window.scrollY>42);
}
addEventListener('scroll',updateStory,{passive:true});
addEventListener('resize',updateStory);
updateStory();

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('show');observer.unobserve(e.target)}
  });
},{threshold:.12});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

const pdata=[
['01 · Estudio inicial','Entendemos tu hogar.','Analizamos vivienda, consumo y objetivos para encontrar la solución que mejor encaja.','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85'],
['02 · Propuesta personalizada','Diseñamos a medida.','Convertimos tus necesidades en una propuesta clara y adaptada.','https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85'],
['03 · Instalación','Lo hacemos realidad.','Coordinamos la instalación buscando seguridad, precisión y mínimas molestias.','https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=85'],
['04 · Puesta en marcha','Tu sistema empieza a trabajar.','Comprobamos el funcionamiento y te explicamos cómo aprovecharlo.','https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=85'],
['05 · Seguimiento','Seguimos a tu lado.','La instalación termina, pero la atención continúa.','https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=85']
];
const visual=document.getElementById('processVisual');
document.querySelectorAll('.step').forEach(step=>{
  step.addEventListener('click',()=>{
    document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
    step.classList.add('active');
    const d=pdata[+step.dataset.step];
    document.getElementById('procEye').textContent=d[0];
    document.getElementById('procTitle').textContent=d[1];
    document.getElementById('procText').textContent=d[2];
    visual.style.backgroundImage=`linear-gradient(0deg,rgba(8,7,6,.68),rgba(8,7,6,.05)),url('${d[3]}')`;
  });
});