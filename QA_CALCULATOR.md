# QA — Calculadora solar Ekinova

Objetivo: intentar romper la calculadora antes de darla por cerrada. No basta con el camino feliz. Cada caso debe marcarse como **PASA / FALLA / DUDOSO** y, si falla, documentar:
- pasos exactos;
- resultado esperado;
- resultado real;
- consola;
- si el usuario puede recuperarse sin recargar;
- captura si aporta contexto.

## Entorno obligatorio
1. Arrancar `node server.js`.
2. Abrir `http://localhost:3000`.
3. Probar escritorio y móvil/responsive.
4. No usar Live Server (5500) ni GitHub Pages para validar el cálculo real.

## 1. Ubicación
- Vacío.
- 4 dígitos.
- 5 dígitos válidos.
- 6 dígitos.
- Solo letras: localidad válida.
- Localidad inexistente.
- Código postal + localidad.
- Espacios al principio/final.
- Caracteres especiales.
- Error de red / backend no disponible.
- Recuperación: error -> corregir -> calcular sin recargar.

## 2. Consumo rápido en kWh
- Vacío.
- 0.
- 1.
- 499.
- 500.
- 501.
- 4.237.
- 30.000.
- 30.001.
- Número negativo.
- Texto pegado.
- Decimal.
- Cambiar kWh -> factura -> kWh tras error.
- Calcular -> cambiar consumo -> recalcular.

## 3. Factura mensual
- Mínimo del slider.
- Máximo del slider.
- Valores intermedios.
- Cambiar varias veces antes de calcular.
- Calcular -> cambiar slider -> recalcular.
- Cambiar factura -> kWh -> factura y comprobar estado.

## 4. Orientación
- Ninguna seleccionada.
- Sur.
- Este/Oeste.
- Norte.
- No lo sé.
- Calcular -> cambiar orientación -> recalcular.
- Norte -> datos avanzados -> orientación precisa válida.
- No lo sé -> datos avanzados sin orientación precisa.
- No lo sé -> datos avanzados con orientación precisa.

## 5. Perfil horario
- Ninguno.
- Día.
- Repartido.
- Tarde/noche.
- Cambiar después de un resultado y recalcular.

## 6. Sombras
- Ninguna.
- No.
- No estoy seguro.
- Sí.
- No estoy seguro -> continuar con factura.
- Sí -> comprobar que no permite una falsa precisión.
- Cambiar sombras después de un resultado.

## 7. Flujo de resultado
- Camino feliz completo.
- Resultado -> cambiar un dato -> nuevo resultado.
- Resultado -> provocar error -> comprobar que NO queda visible el resultado antiguo.
- Error -> corregir -> resultado.
- Error A -> corregir -> Error B -> corregir -> resultado.
- Doble clic rápido en calcular.
- Cambiar un campo mientras la consulta está en curso.
- Lanzar dos cálculos consecutivos con datos distintos y verificar que solo gana el último.

## 8. Datos reales / avanzados
### Consumo anual
- Vacío.
- 99.
- 100.
- 50.000.
- 50.001.
- Decimal.
- Valor coherente con mensual.
- Valor incoherente >5 % con mensual.

### Precio compra
- Vacío.
- 0,02.
- 0,03.
- 0,20.
- 1,00.
- 1,01.
- Punto decimal.
- Coma decimal.
- Texto.

### Excedentes
- Vacío.
- 0.
- 0,06.
- 0,50.
- 0,51.
- Mayor que precio de compra.
- Igual que precio de compra.
- Punto/coma decimal.
- Texto.

### Cubierta
- Mantener rápida.
- Sur / SE / SO / Este / Oeste / E-O / Norte.
- Inclinación desconocida.
- 10 / 20 / 30 / 40 / 50 grados.
- Orientación desconocida rápida + avanzada sin resolver.
- Cambiar cubierta tras resultado.

## 9. Consumos mensuales
- Activar y dejar todos vacíos.
- Solo enero.
- Falta un mes intermedio.
- 12 meses a cero.
- Un valor negativo.
- Un valor >10.000.
- Total igual al anual.
- Diferencia <=5 %.
- Diferencia >5 %.
- Activar -> error -> desactivar -> recalcular.
- Activar -> rellenar -> desactivar -> comprobar que no se usan.
- Volver a activar y comprobar que los valores permanecen visibles/coherentes.

## 10. Fallos de servicios
- Backend apagado.
- Geocodificación 404.
- Geocodificación 5xx.
- PVGIS 5xx.
- Respuesta JSON inválida.
- Serie PVGIS vacía.
- Reintentar después de fallo sin recargar.
- Verificar que nunca aparecen al usuario textos tipo:
  - Failed to fetch
  - NetworkError
  - stack traces
  - HTTP 500
  - undefined / NaN

## 11. UX / accesibilidad básica
- El mensaje de error explica qué pasa en lenguaje de cliente.
- El mensaje aparece cerca del flujo que se está usando.
- El campo incorrecto recibe foco cuando procede.
- El usuario puede editarlo inmediatamente.
- `aria-invalid` se elimina al corregir.
- El botón se reactiva tras fallo.
- No hay saltos de scroll inexplicables.
- No hay resultados viejos visibles tras un intento fallido.
- Enter envía correctamente.
- Navegación por teclado razonable.
- No hay overflow horizontal en 360 / 390 / 768 / 1024 / 1440.

## 12. Criterio de cierre
La calculadora no se considera cerrada hasta que:
- todos los casos críticos PASAN;
- no hay errores técnicos expuestos al usuario;
- cualquier error es recuperable sin recargar;
- los resultados previos no contaminan intentos posteriores;
- desktop y móvil funcionan;
- se repite una regresión final completa después del último fix.


## Evidencia manual con servicios reales — 22/09/2026
Pruebas ejecutadas desde el entorno local con `node server.js`, conectando con Nominatim y PVGIS reales:

- `05001 / 4200 kWh / Sur / Repartido / Sin sombras` — PASA.
- `28001 / 6500 kWh / Este-Oeste / Día / Sin sombras` — PASA.
- `38001 / 3500 kWh / Sur / Tarde-noche / Sin sombras` — PASA; se valida además el flujo de zona Canarias.
- `05001 / 500 kWh / Sur / Repartido / Sin sombras` — PASA; el límite bajo se resuelve sin error técnico.
- `05001 / 30000 kWh / Sur / Repartido / Sin sombras` — PASA; el límite alto se resuelve sin romper el flujo.
- En los casos anteriores se comprobó también el recálculo tras modificar datos sin necesidad de recargar la página.

Esta evidencia complementa la auditoría automatizada con respuestas simuladas. Sigue pendiente el cierre de la Sección 11, el barrido de overflow y la regresión final completa después de los últimos fixes.

## Auditoría final y endurecimiento — 23/09/2026

### Resultado de la auditoría de Claude
- Bloqueantes confirmados: **ninguno**.
- Validación de ubicación, consumo, factura, orientación, perfil y sombras: **PASA** en los casos ejecutados.
- Errores de servicio probados: geocodificación 404/5xx, PVGIS 5xx, JSON inválido, serie vacía y caída de red: **PASA**.
- Recuperación tras error sin recargar: **PASA**.
- Condición de carrera entre dos cálculos: **PASA**.
- Doble clic rápido: **PASA**.
- Enter envía: **PASA**.
- `aria-invalid` se limpia al corregir: **PASA**.
- Overflow horizontal en 360 / 390 / 768 / 1024 / 1440: **PASA**.

### Incidencia "Consultando…" al editar durante una petición
El informe de Claude detectó esta incidencia sobre una versión anterior del frontend. En el HEAD actual ya está corregida:

- los estados de carga se etiquetan con `dataset.state='loading'`;
- `clearEstimatorError()` limpia `error`, `loading` y `success`;
- `handleEstimatorEdit()` invalida la petición pendiente, reactiva los botones, limpia el estado y elimina resultados anteriores.

Por tanto, el fallo documentado queda **corregido en código** y debe incluirse como regresión específica en la siguiente ejecución automatizada/manual.

### Endurecimiento adicional aplicado
- Los formularios exponen `aria-busy="true"` durante una consulta y lo eliminan al terminar o invalidarse.
- Los fallos recuperables de red/servicio ya no se registran como `console.error` en el navegador; se muestran exclusivamente mediante mensajes controlados para el usuario.
- Se mantiene la protección de carrera por `estimateRunId`, de modo que una respuesta antigua no puede sobrescribir un cálculo más reciente.

### Único cierre manual pendiente
Antes de considerar cumplido literalmente el criterio de cierre de este documento, queda una ronda corta en **móvil real**:
1. Camino feliz completo.
2. Provocar un error de validación.
3. Corregirlo y obtener resultado sin recargar.
4. Editar un campo durante “Consultando…” y confirmar que el estado desaparece.
5. Recorrido básico con Tab / controles nativos donde proceda.

No se conocen fallos funcionales actuales en el motor. Esta ronda es verificación final de dispositivo, no una corrección pendiente conocida.
