const http=require('http');
const https=require('https');
const fs=require('fs');
const path=require('path');
const {URL}=require('url');

const ROOT=__dirname;
const PORT=process.env.PORT||3000;

const mime={
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp'
};

function send(res,status,body,type='application/json; charset=utf-8'){
  res.writeHead(status,{
    'Content-Type':type,
    'Access-Control-Allow-Origin':'*',
    'Cache-Control':'no-store'
  });
  res.end(body);
}

function getJson(url,headers={}){
  return new Promise((resolve,reject)=>{
    https.get(url,{headers},response=>{
      let body='';
      response.setEncoding('utf8');
      response.on('data',chunk=>body+=chunk);
      response.on('end',()=>{
        if(response.statusCode<200||response.statusCode>=300){
          reject(new Error('HTTP '+response.statusCode+' al consultar '+new URL(url).hostname));
          return;
        }
        try{resolve(JSON.parse(body));}
        catch(error){reject(new Error('Respuesta JSON no válida'));}
      });
    }).on('error',reject);
  });
}

async function handleGeocode(reqUrl,res){
  const q=(reqUrl.searchParams.get('q')||'').trim();
  if(!q){send(res,400,JSON.stringify({error:'Falta la ubicación.'}));return;}

  try{
    const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name',q);
    url.searchParams.set('count','5');
    url.searchParams.set('language','es');
    url.searchParams.set('format','json');
    url.searchParams.set('countryCode','ES');

    const data=await getJson(url.toString(),{'User-Agent':'Ekinova-Klima-Estimator/0.1'});
    const results=Array.isArray(data.results)?data.results:[];
    if(!results.length){
      send(res,404,JSON.stringify({error:'No hemos encontrado esa ubicación. Prueba con código postal o localidad.'}));
      return;
    }

    const best=results[0];
    send(res,200,JSON.stringify({
      lat:Number(best.latitude),
      lon:Number(best.longitude),
      timezone:best.timezone||'Europe/Madrid',
      label:[best.name,best.admin1,best.country].filter(Boolean).join(', ')
    }));
  }catch(error){
    send(res,502,JSON.stringify({error:'No hemos podido comprobar la ubicación ahora mismo.'}));
  }
}

async function handlePvgis(reqUrl,res){
  const lat=Number(reqUrl.searchParams.get('lat'));
  const lon=Number(reqUrl.searchParams.get('lon'));
  const aspect=Number(reqUrl.searchParams.get('aspect'));

  if(!Number.isFinite(lat)||!Number.isFinite(lon)||!Number.isFinite(aspect)){
    send(res,400,JSON.stringify({error:'Parámetros solares incompletos.'}));
    return;
  }

  try{
    const url=new URL('https://re.jrc.ec.europa.eu/api/v5_3/seriescalc');
    const params={
      lat,lon,
      startyear:2019,
      endyear:2023,
      pvcalculation:1,
      peakpower:1,
      loss:14,
      angle:30,
      aspect,
      pvtechchoice:'crystSi',
      mountingplace:'building',
      usehorizon:1,
      outputformat:'json'
    };
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,String(v)));

    const data=await getJson(url.toString(),{'User-Agent':'Ekinova-Klima-Estimator/0.1'});
    send(res,200,JSON.stringify(data));
  }catch(error){
    send(res,502,JSON.stringify({error:'PVGIS no ha podido calcular la producción ahora mismo.'}));
  }
}

function serveStatic(reqUrl,res){
  let pathname=decodeURIComponent(reqUrl.pathname);
  if(pathname==='/') pathname='/index.html';

  const filePath=path.normalize(path.join(ROOT,pathname));
  if(!filePath.startsWith(ROOT)){
    send(res,403,'Forbidden','text/plain; charset=utf-8');
    return;
  }

  fs.stat(filePath,(err,stat)=>{
    if(err||!stat.isFile()){
      send(res,404,'Not found','text/plain; charset=utf-8');
      return;
    }
    const ext=path.extname(filePath).toLowerCase();
    res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream'});
    fs.createReadStream(filePath).pipe(res);
  });
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){
    res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    res.end();
    return;
  }

  const reqUrl=new URL(req.url,'http://localhost:'+PORT);
  if(reqUrl.pathname==='/api/geocode'){await handleGeocode(reqUrl,res);return;}
  if(reqUrl.pathname==='/api/pvgis'){await handlePvgis(reqUrl,res);return;}
  serveStatic(reqUrl,res);
});

server.listen(PORT,()=>{
  console.log('Ekinova Klima en http://localhost:'+PORT);
  console.log('Abre esa dirección en el navegador para probar el simulador.');
});
