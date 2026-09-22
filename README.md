# Ekinova Klima — Web

Prototipo de una web moderna para una empresa de soluciones energéticas para el hogar.

## Estado
Proyecto en desarrollo.

## Incluye
- Hero premium
- Transición narrativa al hacer scroll
- Servicios
- Beneficios
- Simulador solar transparente conectado a PVGIS (prototipo en `dev`)
- Sección interactiva "Cómo trabajamos"
- Contacto
- Responsive básico

## Estructura

```text
nova-energy-github/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ main.js
└─ assets/
   └─ images/
```

## Importante
- Las imágenes actuales se cargan desde Unsplash y son temporales.
- Antes de publicar la web definitiva conviene sustituirlas por recursos propios/locales y optimizados.
- El formulario es únicamente visual por ahora.

## GitHub Pages
Cuando el repositorio esté subido a GitHub:

1. Abre el repositorio.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda los cambios.
6. GitHub generará una URL pública para la web.

## Próximos pasos
- Sustituir nombre, logo y colores por la marca definitiva.
- Confirmar servicios reales.
- Añadir imágenes/vídeos propios.
- Pulir móvil.
- Preparar proyectos reales.
- Conectar formulario.
- Añadir textos legales, privacidad y cookies.
- Optimizar SEO y rendimiento.


## Simulador solar
La rama `dev` incluye una primera versión funcional del estimador:
- consulta producción fotovoltaica horaria real con PVGIS 5.3 mediante el proxy local;
- separa autoconsumo directo y excedentes;
- aplica la compensación de excedentes mes a mes dentro del modelo económico;
- muestra rangos en lugar de prometer una cifra exacta;
- permite recalcular con consumo anual y precios reales de la factura;
- se niega a dar una cifra rápida cuando orientación norte o sombras confirmadas hacen que falten datos críticos;
- en el modo con factura permite continuar con sombras inciertas, pero marca la confianza como baja y declara que no se ha inventado una corrección por sombras;
- admite orientación e inclinación más precisas y consumos mensuales con validación contra el total anual.

### Importante antes de producción
El prototipo local usa Nominatim / OpenStreetMap para geocodificación y PVGIS 5.3 (JRC / Comisión Europea) para producción fotovoltaica. Ambas consultas pasan por `server.js`, evitando llamadas AJAX directas a PVGIS desde el navegador.

Los rangos de precios de energía y excedentes del prototipo son supuestos editables, no tarifas prometidas. Deben revisarse antes del lanzamiento y el resultado final debe seguir identificándose como estimación.


### Probar el simulador en local

PVGIS no permite llamadas AJAX directas desde el navegador. Para probar el cálculo real, la rama `dev` incluye un servidor Node sin dependencias externas que actúa como proxy.

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta `node server.js`.
3. Abre `http://localhost:3000` en el navegador.
4. Prueba el simulador desde esa dirección.

El servidor sirve la propia web y consulta PVGIS desde Node, evitando el bloqueo CORS.

### Arquitectura prevista para producción
La versión pública deberá mover las rutas `/api/geocode` y `/api/pvgis` a una función backend/serverless (por ejemplo, Vercel/Netlify/Cloudflare) para que la web publicada pueda mantener la misma lógica sin exponer claves ni depender de CORS.

#### Prioridad importante para producción: caché
Implementar caché en backend para geocodificación y consultas repetidas a PVGIS. Si varios usuarios consultan la misma zona y parámetros solares, reutilizar temporalmente una respuesta válida en lugar de repetir la petición externa. Objetivos:
- reducir llamadas a servicios externos;
- acelerar la respuesta de la calculadora;
- disminuir consumo y coste de funciones serverless;
- mejorar la resiliencia ante picos de tráfico;
- evitar consultas duplicadas innecesarias.

La política de expiración de caché deberá definirse antes del despliegue según el tipo de dato: la geocodificación puede reutilizarse durante mucho más tiempo que otros datos operativos.