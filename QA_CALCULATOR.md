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
