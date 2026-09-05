# Interfaz administrable de la tienda

Esta carpeta es la fuente de verdad que debe modificar el futuro dashboard. Los componentes no deben editarse para cambiar catálogo, promociones o contenido comercial.

## Archivos administrables

- `catalog.json`: categorías y productos.
- `promotions.json`: descuentos automáticos, cupones y banners.
- `store.json`: marca, metadatos, textos del catálogo, pie, correo de pedidos, moneda y programa de fidelidad.

`schema.ts` valida la estructura; `catalog.ts`, `promotions.ts` y `store.ts` validan relaciones y publican datos ya ordenados para la aplicación. `index.ts` es solo un punto de exportación para herramientas. Ninguno de esos archivos es contenido y el dashboard debe limitar sus cambios a los tres JSON.

## Reglas generales

- Mantener `schemaVersion` en `1` hasta que exista una migración explícita.
- Los `id` son permanentes, únicos y usan minúsculas, números y guiones. No se deben reutilizar.
- `sortOrder` controla el orden ascendente. Se recomienda usar saltos de 10 para poder insertar elementos.
- `active: false` oculta o desactiva el registro sin eliminarlo.
- Las imágenes deben usar HTTPS y estar alojadas en `i.imgur.com` o `placehold.co`, dominios permitidos por la aplicación.
- Los importes son números, no textos, y no incluyen el símbolo de moneda.
- Después de cualquier edición se debe ejecutar `npm run typecheck` y `npm run build`. Vercel rechazará una configuración inválida durante la compilación.

## Catálogo

Cada producto referencia una categoría mediante `categoryId`. No se puede eliminar una categoría mientras existan productos que la referencien: primero hay que reasignarlos o eliminarlos. Desactivar una categoría también oculta sus productos.

- `availability`: `available` o `out_of_stock`.
- `stock`: es opcional. Ausente o `null` significa stock no controlado y no muestra cantidades. Con `availability: available` debe ser un entero positivo; `0` exige `availability: out_of_stock`. Un producto `out_of_stock` no puede declarar stock positivo.
- `featured`: muestra el distintivo de destacado y sitúa el producto antes que los no destacados.
- `active`: permite retirar un producto sin perder su registro.
- `sortOrder`: controla el orden dentro del catálogo después de los destacados.
- `tags`: el tag `nuevo` muestra el distintivo de novedad sin sustituir al de destacado; ambos pueden aparecer simultáneamente y los demás tags se conservan.
- `customization`: es opcional y define opciones de personalización, recargos y textos sin lógica específica por producto.
- `price`: precio efectivo que paga el cliente. Sin rebaja, también es el precio base.
- `originalPrice`: precio base opcional cuando el producto está rebajado. Si existe, debe ser estrictamente mayor que `price`; el porcentaje se calcula en la interfaz y no se almacena.

## Promociones

Los descuentos automáticos actuales se aplican al total del pedido. Pueden limitarse por nivel de fidelidad, subtotal mínimo, fechas y número de compra. Si un descuento no es acumulable, tiene prioridad el menor `sortOrder`; los acumulables se procesan en ese mismo orden.

Los cupones aceptan descuentos `percentage` o `fixed`, fechas, subtotal mínimo y un límite de usos por dispositivo. Los códigos se comparan sin distinguir mayúsculas y normalizando espacios. Cambiar el `id` de un cupón reinicia su historial local de uso.

Los banners admiten actualmente la ubicación `catalog-top`. Para publicar uno debe añadirse con `active: true`; `imageUrl` y el enlace son opcionales. `linkLabel` y `linkHref` deben aparecer juntos.

## Cambios seguros desde GitHub

El dashboard debe leer el archivo actual, modificar solo el registro solicitado y crear un commit con los tres JSON válidos. Para operaciones que afectan relaciones —por ejemplo, eliminar una categoría— debe enviar todos los cambios relacionados en el mismo commit. La compilación de Vercel actúa como última barrera de validación antes del deploy.
