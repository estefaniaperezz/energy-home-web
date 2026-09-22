const root=document.documentElement;
const story=document.querySelector('.story');
const nav=document.getElementById('nav');
const whatsappFloat=document.querySelector('.whatsapp-float');

function updateStory(){
  const rect=story.getBoundingClientRect();
  const total=story.offsetHeight-window.innerHeight;
  const raw=Math.min(1,Math.max(0,-rect.top/Math.max(1,total)));
  // La transición comienza antes para evitar un tramo de scroll sin respuesta visual.
  const active=Math.min(1,Math.max(0,(raw-.03)/.82));
  const p=active*active*(3-2*active);
  root.style.setProperty('--p',p.toFixed(4));
  nav.classList.toggle('scrolled',window.scrollY>42);
  if(whatsappFloat){
    const revealAt=Math.max(280,Math.min(420,window.innerHeight*.38));
    whatsappFloat.classList.toggle('is-visible',window.scrollY>revealAt);
  }
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
['01 · Estudio inicial','Entendemos tu proyecto.','Analizamos el espacio, el consumo y tus objetivos para encontrar la solución que mejor encaja.','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85'],
['02 · Propuesta personalizada','Diseñamos a medida.','Convertimos tus necesidades en una propuesta clara y adaptada.','https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85'],
['03 · Instalación','Lo hacemos realidad.','Coordinamos la instalación buscando seguridad, precisión y mínimas molestias.','assets/images/instalacion-ekinova.webp'],
['04 · Puesta en marcha','Tu sistema empieza a trabajar.','Comprobamos el funcionamiento y te explicamos cómo aprovecharlo.','https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=85'],
['05 · Seguimiento','Seguimos a tu lado.','La instalación termina, pero la atención continúa.','https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=85']
];
const visual=document.getElementById('processVisual');
const processSteps=[...document.querySelectorAll('.step')];

processSteps.forEach(step=>{
  const d=pdata[+step.dataset.step];
  // Resolve to an absolute URL so local preview and GitHub Pages behave the same.
  const stepImageUrl=new URL(d[3],document.baseURI).href;
  step.style.setProperty('--step-image',`url("${stepImageUrl}")`);

  step.addEventListener('click',()=>{
    processSteps.forEach(s=>s.classList.remove('active'));
    step.classList.add('active');
    const current=pdata[+step.dataset.step];
    document.getElementById('procEye').textContent=current[0];
    document.getElementById('procTitle').textContent=current[1];
    document.getElementById('procText').textContent=current[2];
    visual.style.backgroundImage=`linear-gradient(0deg,rgba(11,34,57,.72),rgba(11,34,57,.08)),url('${current[3]}')`;
  });
});

// Ekinova solar estimator — transparent, data-led prototype

const contactSection=document.getElementById('contacto');
const contactBox=contactSection?.querySelector('.contact-box');
const contactCopy=contactSection?.querySelector('.contact-copy');
const contactImage=contactSection?.querySelector('.contact-image');

function updateContactReveal(){
  if(!contactBox||!contactCopy||!contactImage) return;

  const desktop=window.matchMedia('(min-width:981px)').matches;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(!desktop||reducedMotion){
    contactCopy.style.transform='';
    contactCopy.style.opacity='';
    contactImage.style.removeProperty('--contact-image-y');
    return;
  }

  const rect=contactBox.getBoundingClientRect();
  const start=window.innerHeight*.92;
  const end=window.innerHeight*.24;
  const raw=Math.min(1,Math.max(0,(start-rect.top)/Math.max(1,start-end)));
  const p=raw*raw*(3-2*raw);

  const lift=36*(1-p);
  const opacity=.38+(.62*p);
  const imageY=10-(20*p);

  contactCopy.style.transform='translateY('+lift.toFixed(1)+'px)';
  contactCopy.style.opacity=opacity.toFixed(3);
  contactImage.style.setProperty('--contact-image-y',imageY.toFixed(1)+'px');
}

addEventListener('scroll',updateContactReveal,{passive:true});
addEventListener('resize',updateContactReveal);
updateContactReveal();

const estimatorForm=document.getElementById('solarEstimator');
const estimateButton=document.getElementById('estimateButton');
const estimatorStatus=document.getElementById('estimatorStatus');
const solarLocation=document.getElementById('solarLocation');
const annualKwhInput=document.getElementById('annualKwh');
const quickBill=document.getElementById('quickBill');
const quickBillValue=document.getElementById('quickBillValue');
const kwhMode=document.getElementById('kwhMode');
const billMode=document.getElementById('billMode');
const estimateResult=document.getElementById('estimateResult');
const resultEmpty=document.getElementById('resultEmpty');
const resultData=document.getElementById('resultData');
const needsStudy=document.getElementById('needsStudy');
const realDataToggle=document.getElementById('realDataToggle');
const realDataPanel=document.getElementById('realDataPanel');
const realDataForm=document.getElementById('realDataForm');
const advancedDataToggle=document.getElementById('advancedDataToggle');
const advancedDataFields=document.getElementById('advancedDataFields');
const useMonthlyData=document.getElementById('useMonthlyData');
const monthlyConsumptionGrid=document.getElementById('monthlyConsumptionGrid');
const monthlyTotal=document.getElementById('monthlyTotal');
const monthlyCheck=document.getElementById('monthlyCheck');

const ESTIMATOR_ASSUMPTIONS={
  startYear:2019,
  endYear:2023,
  systemLoss:14,
  referenceTilt:30,
  targetCoverage:.85,
  buyPrice:[.15,.25],
  exportPrice:[.03,.10],
  billVariableShare:[.60,.80]
};

const CONSUMPTION_PROFILES={
  day:[.35,.32,.30,.30,.36,.55,1.05,1.35,1.35,1.35,1.40,1.45,1.45,1.40,1.35,1.35,1.45,1.55,1.65,1.45,1.10,.82,.58,.42],
  balanced:[.48,.43,.40,.39,.43,.62,1.05,1.30,1.10,.95,.90,.92,.95,.95,.95,1.05,1.35,1.75,2.00,1.90,1.55,1.15,.82,.60],
  night:[.62,.55,.50,.47,.50,.68,1.10,1.35,.88,.62,.55,.52,.50,.52,.58,.78,1.28,1.95,2.35,2.40,2.05,1.55,1.05,.78]
};

let consumptionMode='kwh';
let lastEstimateContext=null;
const solarCache=new Map();
const geocodeCache=new Map();

document.querySelectorAll('[data-consumption-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
    consumptionMode=button.dataset.consumptionMode;
    document.querySelectorAll('[data-consumption-mode]').forEach(b=>b.classList.toggle('active',b===button));
    kwhMode.hidden=consumptionMode!=='kwh';
    billMode.hidden=consumptionMode!=='bill';
  });
});

if(quickBill){
  quickBill.addEventListener('input',()=>{
    quickBillValue.textContent=quickBill.value;
  });
}

function selectedValue(name){
  const el=document.querySelector('input[name="'+name+'"]:checked');
  return el?el.value:null;
}

function clamp(value,min,max){
  return Math.min(max,Math.max(min,value));
}

function parseDecimal(value){
  if(value===null||value===undefined) return NaN;
  const normalized=String(value).trim().replace(',','.');
  return normalized===''?NaN:Number(normalized);
}

function roundHalf(value){
  return Math.round(value*2)/2;
}

function roundTen(value){
  return Math.round(value/10)*10;
}

function roundFifty(value){
  return Math.round(value/50)*50;
}

function formatInt(value){
  return new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(Math.max(0,Math.round(value)));
}

function formatDecimal(value,digits=1){
  return new Intl.NumberFormat('es-ES',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(value);
}

function formatRange(min,max,step=50){
  const a=Math.floor(min/step)*step;
  const b=Math.ceil(max/step)*step;
  return formatInt(a)+'–'+formatInt(b);
}

function daysInYear(year){
  return new Date(year,1,29).getMonth()===1?366:365;
}

function getQuickConsumption(){
  if(consumptionMode==='kwh'){
    const value=Number(annualKwhInput.value);
    if(!Number.isFinite(value)||value<500) throw new Error('Introduce tu consumo anual en kWh.');
    return {min:value,max:value,basis:'kwh'};
  }

  const bill=Number(quickBill.value);
  const annualSpend=bill*12;
  const min=annualSpend*ESTIMATOR_ASSUMPTIONS.billVariableShare[0]/ESTIMATOR_ASSUMPTIONS.buyPrice[1];
  const max=annualSpend*ESTIMATOR_ASSUMPTIONS.billVariableShare[1]/ESTIMATOR_ASSUMPTIONS.buyPrice[0];
  return {
    min:clamp(min,700,30000),
    max:clamp(max,700,30000),
    basis:'bill',
    bill
  };
}

const API_BASE=(location.hostname==='localhost'||location.hostname==='127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

async function geocodeLocation(query){
  const clean=query.trim();
  if(!clean) throw new Error('Introduce el código postal o la localidad.');
  const key=clean.toLowerCase();
  if(geocodeCache.has(key)) return geocodeCache.get(key);

  const cached=sessionStorage.getItem('ekinova-geocode-'+key);
  if(cached){
    const parsed=JSON.parse(cached);
    geocodeCache.set(key,parsed);
    return parsed;
  }

  const response=await fetch(API_BASE+'/geocode?q='+encodeURIComponent(clean));
  if(!response.ok){
    const detail=await response.json().catch(()=>({}));
    throw new Error(detail.error||'No hemos podido comprobar la ubicación.');
  }
  const result=await response.json();
  geocodeCache.set(key,result);
  sessionStorage.setItem('ekinova-geocode-'+key,JSON.stringify(result));
  return result;
}

const timeFormatters=new Map();

function pvgisLocalParts(time,timezone){
  const year=Number(time.slice(0,4));
  const month=Number(time.slice(4,6));
  const day=Number(time.slice(6,8));
  const hour=Number(time.slice(9,11));
  const minute=Number(time.slice(11,13))||0;
  const date=new Date(Date.UTC(year,month-1,day,hour,minute));

  if(!timeFormatters.has(timezone)){
    timeFormatters.set(timezone,new Intl.DateTimeFormat('en-GB',{
      timeZone:timezone,
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      hourCycle:'h23'
    }));
  }

  const parts={};
  timeFormatters.get(timezone).formatToParts(date).forEach(part=>{
    if(part.type!=='literal') parts[part.type]=part.value;
  });

  return {
    year:Number(parts.year),
    month:Number(parts.month)-1,
    hour:Number(parts.hour)
  };
}

async function fetchPvgisSeries(lat,lon,aspect,timezone,angle=ESTIMATOR_ASSUMPTIONS.referenceTilt){
  const response=await fetch(
    API_BASE+'/pvgis?lat='+encodeURIComponent(lat)+
    '&lon='+encodeURIComponent(lon)+
    '&aspect='+encodeURIComponent(aspect)+
    '&angle='+encodeURIComponent(angle)
  );

  if(!response.ok){
    const detail=await response.json().catch(()=>({}));
    throw new Error(detail.error||'PVGIS no ha podido devolver datos para esta ubicación.');
  }

  const data=await response.json();
  const hourly=data&&data.outputs&&data.outputs.hourly;
  if(!Array.isArray(hourly)||!hourly.length){
    throw new Error('PVGIS no ha devuelto una serie horaria válida.');
  }

  return hourly.map(row=>{
    const time=String(row.time);
    const local=pvgisLocalParts(time,timezone);
    return {
      time,
      P:Number(row.P)||0,
      localYear:local.year,
      localMonth:local.month,
      localHour:local.hour
    };
  });
}

async function getSolarSeries(lat,lon,orientation,timezone,angle=ESTIMATOR_ASSUMPTIONS.referenceTilt){
  const cacheKey=[lat.toFixed(4),lon.toFixed(4),orientation,timezone,angle].join('|');
  if(solarCache.has(cacheKey)) return solarCache.get(cacheKey);

  const aspects={
    south:0,
    southeast:-45,
    southwest:45,
    east:-90,
    west:90,
    north:180
  };

  let series;
  if(orientation==='eastwest'){
    const [east,west]=await Promise.all([
      fetchPvgisSeries(lat,lon,-90,timezone,angle),
      fetchPvgisSeries(lat,lon,90,timezone,angle)
    ]);
    const length=Math.min(east.length,west.length);
    series=Array.from({length},(_,i)=>({
      time:east[i].time,
      P:(east[i].P+west[i].P)/2,
      localYear:east[i].localYear,
      localMonth:east[i].localMonth,
      localHour:east[i].localHour
    }));
  }else if(Object.prototype.hasOwnProperty.call(aspects,orientation)){
    series=await fetchPvgisSeries(lat,lon,aspects[orientation],timezone,angle);
  }else{
    throw new Error('Necesitamos una orientación calculable.');
  }

  solarCache.set(cacheKey,series);
  return series;
}


function annualYieldPerKwp(series){
  const years=new Map();
  series.forEach(row=>{
    const year=row.localYear||Number(row.time.slice(0,4));
    const value=(row.P||0)/1000;
    years.set(year,(years.get(year)||0)+value);
  });
  const values=[...years.values()].filter(v=>v>0);
  if(!values.length) throw new Error('No se ha podido calcular la producción anual.');
  return values.reduce((a,b)=>a+b,0)/values.length;
}

function daysInMonth(year,month){
  return new Date(year,month+1,0).getDate();
}

function simulate(series,annualConsumption,peakPower,profileKey,prices,monthlyConsumption=null){
  const weights=CONSUMPTION_PROFILES[profileKey];
  const weightSum=weights.reduce((a,b)=>a+b,0);
  const years=new Map();

  series.forEach(row=>{
    const year=row.localYear;
    const month=row.localMonth;
    const localHour=row.localHour;
    const dailyConsumption=monthlyConsumption
      ? monthlyConsumption[month]/daysInMonth(year,month)
      : annualConsumption/daysInYear(year);
    const consumption=dailyConsumption*(weights[localHour]/weightSum);
    const production=((row.P||0)/1000)*peakPower;

    if(!years.has(year)){
      years.set(year,Array.from({length:12},()=>({production:0,self:0,exported:0,grid:0})));
    }
    const bucket=years.get(year)[month];
    bucket.production+=production;
    bucket.self+=Math.min(production,consumption);
    bucket.exported+=Math.max(0,production-consumption);
    bucket.grid+=Math.max(0,consumption-production);
  });

  const results=[];
  years.forEach((months,year)=>{
    let production=0;
    let self=0;
    let exported=0;
    let savingLow=0;
    let savingHigh=0;

    months.forEach(month=>{
      production+=month.production;
      self+=month.self;
      exported+=month.exported;

      const selfLow=month.self*prices.buy[0];
      const selfHigh=month.self*prices.buy[1];
      const exportLow=Math.min(month.exported*prices.exported[0],month.grid*prices.buy[0]);
      const exportHigh=Math.min(month.exported*prices.exported[1],month.grid*prices.buy[1]);

      savingLow+=selfLow+exportLow;
      savingHigh+=selfHigh+exportHigh;
    });

    results.push({year,production,self,exported,savingLow,savingHigh});
  });

  return results;
}

function confidenceLabel(basis,shade,advanced,exactPrices,monthlyConsumption,angleIsAssumed){
  if(shade==='unsure') return 'Estimación con incertidumbre';
  if(basis==='bill') return 'Estimación orientativa';
  if(advanced&&exactPrices&&monthlyConsumption&&!angleIsAssumed) return 'Estimación detallada';
  return 'Estimación mejorada';
}

function bringResultIntoView(){
  if(!estimateResult) return;

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      const rect=estimateResult.getBoundingClientRect();
      const navOffset=window.innerWidth<=760?78:96;
      const isNarrow=window.matchMedia('(max-width:980px)').matches;
      const resultIsComfortablyVisible=rect.top>=navOffset && rect.top<window.innerHeight*.42;

      if(isNarrow || !resultIsComfortablyVisible){
        const targetY=window.scrollY+rect.top-navOffset;
        window.scrollTo({top:Math.max(0,targetY),behavior:'smooth'});
      }
    });
  });
}

function showStudyNeeded(title,text){
  resultEmpty.hidden=true;
  resultData.hidden=true;
  needsStudy.hidden=false;
  document.getElementById('needsStudyTitle').textContent=title;
  document.getElementById('needsStudyText').textContent=text;
  realDataPanel.hidden=true;
  bringResultIntoView();
}

function resetResultState(){
  needsStudy.hidden=true;
  resultData.hidden=true;
  resultEmpty.hidden=false;
}

function renderEstimate(payload){
  const all=payload.scenarios;
  const savingLow=Math.min(...all.map(r=>r.savingLow));
  const savingHigh=Math.max(...all.map(r=>r.savingHigh));
  const productionLow=Math.min(...all.map(r=>r.production));
  const productionHigh=Math.max(...all.map(r=>r.production));
  const selfLow=Math.min(...all.map(r=>r.self));
  const selfHigh=Math.max(...all.map(r=>r.self));
  const exportLow=Math.min(...all.map(r=>r.exported));
  const exportHigh=Math.max(...all.map(r=>r.exported));

  resultEmpty.hidden=true;
  needsStudy.hidden=true;
  resultData.hidden=false;

  document.getElementById('savingMin').textContent=formatInt(Math.floor(savingLow/10)*10);
  document.getElementById('savingMax').textContent=formatInt(Math.ceil(savingHigh/10)*10);
  document.getElementById('productionRange').textContent=formatRange(productionLow,productionHigh);
  document.getElementById('selfUseRange').textContent=formatRange(selfLow,selfHigh);
  document.getElementById('exportRange').textContent=formatRange(exportLow,exportHigh);
  document.getElementById('systemSize').textContent='≈ '+formatDecimal(payload.peakPower,1);
  document.getElementById('confidenceBadge').textContent=payload.confidence;

  const shortLocation=payload.location.label.split(',').slice(0,2).join(', ');
  let summary='Simulación preliminar para '+shortLocation+' con una instalación de '+formatDecimal(payload.peakPower,1)+' kWp.';
  if(payload.consumption.basis==='bill'){
    summary+=' Como solo conocemos el importe de la factura, estimamos un consumo amplio de '+formatRange(payload.consumption.min,payload.consumption.max,50)+' kWh/año.';
  }
  document.getElementById('resultSummary').textContent=summary;

  let assumptions='Datos horarios de producción fotovoltaica de PVGIS '+ESTIMATOR_ASSUMPTIONS.startYear+'–'+ESTIMATOR_ASSUMPTIONS.endYear+
    ', pérdidas de sistema del '+ESTIMATOR_ASSUMPTIONS.systemLoss+' % y sin batería. '+
    (payload.monthlyConsumption
      ? 'El consumo anual se reparte según los 12 valores mensuales que has introducido. '
      : 'Al no disponer de consumos mensuales, repartimos el consumo anual de forma uniforme entre los días del año. ')+
    'Dentro de cada día aplicamos el patrón horario elegido. '+
    (payload.angleIsAssumed
      ? 'La inclinación sigue siendo una referencia de '+ESTIMATOR_ASSUMPTIONS.referenceTilt+'°. '
      : 'La producción se ha simulado con una inclinación aproximada de '+payload.angle+'°. ')+
    'La potencia mostrada es una simulación teórica dimensionada para producir aproximadamente el '+
    Math.round(ESTIMATOR_ASSUMPTIONS.targetCoverage*100)+' % del consumo anual; no es una recomendación final de instalación.';

  if(payload.orientation==='eastwest'){
    assumptions+=' En Este-Oeste suponemos un reparto 50/50 de la potencia entre ambas orientaciones.';
  }

  if(payload.profile==='night'){
    assumptions+=' Como has indicado consumo principalmente de tarde/noche, la potencia final debería optimizarse con datos reales para evitar sobredimensionar y generar excedentes de poco valor.';
  }

  if(!payload.exactPrices){
    assumptions+=' Para convertir kWh en euros usamos un rango de referencia de '+formatDecimal(payload.prices.buy[0],2)+'–'+formatDecimal(payload.prices.buy[1],2)+
      ' €/kWh para energía comprada y '+formatDecimal(payload.prices.exported[0],2)+'–'+formatDecimal(payload.prices.exported[1],2)+' €/kWh para excedentes.';
  }else{
    assumptions+=' El cálculo económico usa los precios que has introducido.';
  }

  if(payload.shade==='unsure'){
    assumptions+=' No hemos podido confirmar sombras próximas. El cálculo mostrado NO aplica una corrección inventada por sombras; por eso la confianza se mantiene baja hasta revisar la cubierta.';
  }else{
    assumptions+=' PVGIS considera el horizonte del terreno, pero no las sombras concretas de edificios, árboles o chimeneas próximos; una revisión técnica sigue siendo necesaria.';
  }

  document.getElementById('assumptionText').textContent=assumptions;

  lastEstimateContext=payload;
  bringResultIntoView();
}

function advancedPrices(){
  const buyRaw=document.getElementById('realBuyPrice').value.trim();
  const exportRaw=document.getElementById('realExportPrice').value.trim();
  const buy=buyRaw?parseDecimal(buyRaw):null;
  const exported=exportRaw?parseDecimal(exportRaw):null;

  if(buyRaw && (!Number.isFinite(buy) || buy<.03 || buy>1)){
    throw new Error('Revisa el precio de la energía: debe estar entre 0,03 y 1,00 €/kWh.');
  }

  if(exportRaw && (!Number.isFinite(exported) || exported<0 || exported>.5)){
    throw new Error('Revisa la compensación de excedentes: debe estar entre 0 y 0,50 €/kWh.');
  }

  return {
    buy:Number.isFinite(buy)?[buy,buy]:ESTIMATOR_ASSUMPTIONS.buyPrice,
    exported:Number.isFinite(exported)?[exported,exported]:ESTIMATOR_ASSUMPTIONS.exportPrice,
    exact:Number.isFinite(buy)&&Number.isFinite(exported)
  };
}

function getMonthlyConsumption(){
  if(!useMonthlyData || !useMonthlyData.checked) return null;
  const inputs=[...document.querySelectorAll('#monthlyConsumptionGrid input[data-month]')];

  const emptyMonth=inputs.find(input=>input.value.trim()==='');
  if(emptyMonth){
    const monthLabel=emptyMonth.closest('label')?.childNodes[0]?.textContent.trim()||'un mes';
    throw new Error('Falta el consumo de '+monthLabel+'. Completa los 12 meses o desactiva esa opción.');
  }

  const values=inputs.map(input=>Number(input.value));
  if(values.some(value=>!Number.isFinite(value)||value<0||value>10000)){
    throw new Error('Revisa los consumos mensuales: cada valor debe estar entre 0 y 10.000 kWh.');
  }
  if(values.every(value=>value===0)){
    throw new Error('Los consumos mensuales no pueden estar todos a cero.');
  }
  return values;
}

function advancedRoofData(fallbackOrientation){
  const precise=document.getElementById('preciseOrientation');
  const tilt=document.getElementById('roofTilt');
  return {
    orientation:precise && precise.value ? precise.value : fallbackOrientation,
    angle:tilt && tilt.value ? Number(tilt.value) : ESTIMATOR_ASSUMPTIONS.referenceTilt,
    angleIsAssumed:!(tilt && tilt.value)
  };
}

async function runSolarEstimate(options={}){
  if(!estimatorForm) return;

  const advanced=Boolean(options.advanced);
  const orientation=selectedValue('orientation');
  const profile=selectedValue('profile');
  const shade=selectedValue('shade');

  if(!orientation){estimatorStatus.textContent='Selecciona la orientación del tejado.';return;}
  if(!profile){estimatorStatus.textContent='Indica cuándo consumes más electricidad.';return;}
  if(!shade){estimatorStatus.textContent='Indica si hay sombras próximas al tejado.';return;}

  if(!advanced && orientation==='north'){
    estimatorStatus.textContent='';
    showStudyNeeded(
      'Con orientación norte no queremos adivinar.',
      'El resultado cambia mucho según la inclinación y el tipo de cubierta. Antes de enseñarte una cifra necesitamos confirmar si el tejado es plano, inclinado y cómo podrían colocarse realmente los paneles.'
    );
    return;
  }

  if(!advanced && orientation==='unknown'){
    estimatorStatus.textContent='';
    showStudyNeeded(
      'Necesitamos conocer la orientación.',
      'Sin una orientación aproximada el rango sería demasiado amplio para ser útil. Puedes consultarla con una brújula del móvil o pedirnos que la revisemos contigo.'
    );
    return;
  }

  if(shade==='yes'){
    estimatorStatus.textContent='';
    showStudyNeeded(
      'Las sombras necesitan una revisión real.',
      'Sabemos que existen obstáculos próximos, pero no cuánto afectan ni a qué horas. Aplicar un descuento genérico sería inventar precisión, así que preferimos revisar la cubierta antes de darte una cifra.'
    );
    return;
  }

  if(!advanced && shade==='unsure'){
    estimatorStatus.textContent='';
    showStudyNeeded(
      'Antes de calcular, necesitamos confirmar las sombras.',
      'Si no sabemos si hay árboles, edificios o chimeneas que sombreen la cubierta, el mismo número podría parecer más fiable de lo que es. Puedes usar los datos de tu factura para continuar con una estimación marcada como baja confianza.'
    );
    return;
  }

  let consumption;
  let prices={buy:ESTIMATOR_ASSUMPTIONS.buyPrice,exported:ESTIMATOR_ASSUMPTIONS.exportPrice};
  let exactPrices=false;
  let monthlyConsumption=null;
  let roofData={orientation,angle:ESTIMATOR_ASSUMPTIONS.referenceTilt,angleIsAssumed:true};

  try{
    if(advanced){
      const real=Number(document.getElementById('realAnnualKwh').value);
      if(!Number.isFinite(real)||real<100) throw new Error('Introduce el consumo anual de tu factura.');
      monthlyConsumption=getMonthlyConsumption();
      let realTotal=real;
      if(monthlyConsumption){
        const monthlySum=monthlyConsumption.reduce((a,b)=>a+b,0);
        const difference=Math.abs(monthlySum-real)/Math.max(real,1);
        if(difference>.05){
          throw new Error(
            'Los 12 meses suman '+formatInt(monthlySum)+' kWh, pero tu consumo anual indica '+
            formatInt(real)+' kWh. Revisa cuál de los dos datos es correcto.'
          );
        }
        realTotal=monthlySum;
      }
      consumption={min:realTotal,max:realTotal,basis:'kwh'};
      const custom=advancedPrices();
      prices={buy:custom.buy,exported:custom.exported};
      exactPrices=custom.exact;
      roofData=advancedRoofData(orientation);
    }else{
      consumption=getQuickConsumption();
    }
  }catch(error){
    estimatorStatus.textContent=error.message;
    return;
  }

  const locationQuery=solarLocation.value.trim();
  if(!locationQuery){
    estimatorStatus.textContent='Introduce el código postal o la localidad.';
    return;
  }

  estimateButton.disabled=true;
  estimatorStatus.textContent='Consultando ubicación y datos solares históricos…';

  try{
    const location=await geocodeLocation(locationQuery);
    estimatorStatus.textContent='Calculando producción y cruce horario con tu consumo…';
    const simulationOrientation=advanced?roofData.orientation:orientation;
    const simulationAngle=advanced?roofData.angle:ESTIMATOR_ASSUMPTIONS.referenceTilt;
    if(simulationOrientation==='unknown'){
      throw new Error('Necesitamos una orientación para calcular con datos reales.');
    }

    const series=await getSolarSeries(
      location.lat,
      location.lon,
      simulationOrientation,
      location.timezone||'Europe/Madrid',
      simulationAngle
    );

    const yieldPerKwp=annualYieldPerKwp(series);
    const midConsumption=(consumption.min+consumption.max)/2;
    const theoreticalPower=(midConsumption*ESTIMATOR_ASSUMPTIONS.targetCoverage)/yieldPerKwp;

    if(theoreticalPower<.5){
      throw new Error('Tu consumo es demasiado bajo para que esta estimación rápida dimensione una instalación residencial con sentido. Necesitamos revisarlo de forma personalizada.');
    }

    if(theoreticalPower>15){
      throw new Error('La potencia preliminar supera 15 kWp. Para consumos de este tamaño preferimos hacer un estudio personalizado en lugar de mostrar una cifra residencial simplificada.');
    }

    const peakPower=Math.round(theoreticalPower*10)/10;
    const candidates=consumption.min===consumption.max?[consumption.min]:[consumption.min,consumption.max];
    const scenarios=[];
    candidates.forEach(value=>{
      scenarios.push(...simulate(series,value,peakPower,profile,prices,monthlyConsumption));
    });

    const confidence=confidenceLabel(
      consumption.basis,
      shade,
      advanced,
      exactPrices,
      monthlyConsumption,
      advanced?roofData.angleIsAssumed:true
    );
    renderEstimate({
      scenarios,
      peakPower,
      confidence,
      location,
      orientation:advanced?roofData.orientation:orientation,
      angle:advanced?roofData.angle:ESTIMATOR_ASSUMPTIONS.referenceTilt,
      angleIsAssumed:advanced?roofData.angleIsAssumed:true,
      monthlyConsumption,
      profile,
      shade,
      consumption,
      prices,
      exactPrices,
      advanced
    });

    estimatorStatus.textContent='Estimación calculada. Te mostramos un rango para no fingir una precisión que no tenemos.';
  }catch(error){
    console.error(error);
    resetResultState();
    estimatorStatus.textContent=error && error.message
      ? error.message
      : 'No podemos obtener ahora mismo los datos necesarios. No vamos a sustituirlos por una cifra inventada.';
  }finally{
    estimateButton.disabled=false;
  }
}

if(estimatorForm){
  estimatorForm.addEventListener('submit',event=>{
    event.preventDefault();
    runSolarEstimate();
  });
}

if(realDataToggle){
  realDataToggle.addEventListener('click',()=>{
    realDataPanel.hidden=!realDataPanel.hidden;
    const layout=document.querySelector('.estimator-layout');
    if(layout) layout.classList.toggle('real-data-open',!realDataPanel.hidden);

    if(!realDataPanel.hidden){
      let suggested='';
      if(lastEstimateContext){
        suggested=Math.round((lastEstimateContext.consumption.min+lastEstimateContext.consumption.max)/2);
      }else if(annualKwhInput&&annualKwhInput.value){
        suggested=annualKwhInput.value;
      }
      document.getElementById('realAnnualKwh').value=suggested;

      // Wait for the expanded layout to finish reflowing before scrolling.
      // This prevents the page from overshooting below the form.
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          const navOffset=96;
          const targetY=window.scrollY+realDataPanel.getBoundingClientRect().top-navOffset;
          window.scrollTo({top:Math.max(0,targetY),behavior:'smooth'});
        });
      });
    }
  });
}

if(realDataForm){
  realDataForm.addEventListener('submit',event=>{
    event.preventDefault();
    runSolarEstimate({advanced:true});
  });
}


if(advancedDataToggle){
  advancedDataToggle.addEventListener('click',()=>{
    advancedDataFields.hidden=!advancedDataFields.hidden;
    advancedDataToggle.classList.toggle('open',!advancedDataFields.hidden);
  });
}

function updateMonthlyTotal(){
  if(!monthlyConsumptionGrid||!monthlyTotal) return;
  const values=[...monthlyConsumptionGrid.querySelectorAll('input[data-month]')]
    .map(input=>Number(input.value)||0);
  const total=values.reduce((a,b)=>a+b,0);
  const enabled=useMonthlyData&&useMonthlyData.checked;

  monthlyTotal.textContent=enabled
    ? 'Total de los 12 meses: '+formatInt(total)+' kWh'
    : '';

  if(!monthlyCheck){
    return;
  }

  if(!enabled||!total){
    monthlyCheck.textContent='';
    monthlyCheck.classList.remove('warning','ok');
    return;
  }

  const annual=Number(document.getElementById('realAnnualKwh').value);
  if(!Number.isFinite(annual)||annual<=0){
    monthlyCheck.textContent='Introduce también el consumo anual de la factura para poder comprobar los datos.';
    monthlyCheck.classList.add('warning');
    monthlyCheck.classList.remove('ok');
    return;
  }

  const difference=Math.abs(total-annual)/annual;
  if(difference<=.05){
    monthlyCheck.textContent='Los consumos mensuales son coherentes con el total anual.';
    monthlyCheck.classList.add('ok');
    monthlyCheck.classList.remove('warning');
  }else{
    monthlyCheck.textContent='Revisa los datos: el total mensual difiere más de un 5 % del consumo anual.';
    monthlyCheck.classList.add('warning');
    monthlyCheck.classList.remove('ok');
  }
}

if(useMonthlyData){
  useMonthlyData.addEventListener('change',()=>{
    monthlyConsumptionGrid.hidden=!useMonthlyData.checked;
    updateMonthlyTotal();
  });
}

if(monthlyConsumptionGrid){
  monthlyConsumptionGrid.addEventListener('input',updateMonthlyTotal);
}


const realAnnualKwhInput=document.getElementById('realAnnualKwh');
if(realAnnualKwhInput){
  realAnnualKwhInput.addEventListener('input',updateMonthlyTotal);
}
