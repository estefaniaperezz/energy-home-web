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
- consulta irradiancia solar horaria histórica con Open-Meteo en el prototipo local;
- separa autoconsumo directo y excedentes;
- aplica la compensación de excedentes mes a mes dentro del modelo económico;
- muestra rangos en lugar de prometer una cifra exacta;
- permite recalcular con consumo anual y precios reales de la factura;
- se niega a dar una cifra cuando orientación norte o sombras confirmadas hacen que falten datos críticos.

### Importante antes de producción
El prototipo local usa Open-Meteo Geocoding y Open-Meteo Historical Weather para poder funcionar directamente en el navegador.

Los rangos de precios de energía y excedentes del prototipo son supuestos editables, no tarifas prometidas. Deben revisarse antes del lanzamiento y el resultado final debe seguir identificándose como estimación.


### Arquitectura prevista para producción
PVGIS sigue siendo la referencia objetivo para el motor final, pero su documentación oficial indica que las llamadas AJAX desde navegador no están permitidas. Por tanto, la versión de producción deberá llamar a PVGIS a través de una función backend/serverless propia. Hasta entonces, el prototipo de Live Server utiliza Open-Meteo para que el flujo pueda probarse de extremo a extremo sin fingir resultados.
