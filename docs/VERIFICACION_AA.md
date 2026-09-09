# Verificación de la integración AA

Verificación local realizada el 8 de septiembre de 2026. Backend: InventarioSOAP_A; frontend de trabajo: carpeta hermana InventarioSOAP_A-app; copia de entrega: FrontendAngular.

## Resultados

| Comprobación | Resultado |
|---|---|
| Compilación .NET 10 | Correcta, 0 errores y 0 advertencias. |
| Compilación Angular de producción | Correcta, paquete inicial aproximadamente 374 kB. |
| Pruebas unitarias Angular | 9 pruebas aprobadas en 2 archivos. |
| Prueba real scripts/ProbarIntegracion.ps1 | Correcta: SOAP, REST, CORS, WSDL, SQL y restricciones. |
| Colección InventarioAA ejecutada con Newman | 18 solicitudes, 24 comprobaciones, 0 fallos en el recorrido final. |
| Navegador Angular | Guardado de categoría SOAP y alta/edición de movimiento REST confirmados; consulta SQL confirmó cantidad 4 del movimiento temporal. |
| API pública desde Angular | Consulta en vivo con 12 productos e imágenes, comparación con producto local y mensaje sin resultados verificados. |
| Fallos de la API externa | Respuesta HTTP 503 controlada comprobada en prueba unitaria, sin datos falsos de reemplazo. |
| Script SQL portable sobre base existente | Ejecutado correctamente, sin reemplazar datos existentes. |
| Copia FrontendAngular | Las fuentes src coinciden por hash con la carpeta de trabajo. |

La base contenía 4 categorías, 9 productos y 4 movimientos antes de las pruebas. Los registros temporales creados por las verificaciones se eliminaron mediante los servicios; no se borraron los registros anteriores. Los saltos en los ID autogenerados son normales.

## Cómo repetir

1. Iniciar SQL Server y el backend en 5163.
2. Ejecutar `./scripts/ProbarIntegracion.ps1` desde la raíz (requiere sqlcmd y acceso Windows a SQL).
3. En Angular: `npm.cmd test -- --watch=false` y `npm.cmd run build`.
4. Importar `Postman/InventarioAA.postman_collection.json` en Postman. Ejecutar el recorrido en orden desde AgregarCategoria para que las variables de ID correspondan a los registros nuevos. No usar IDs de datos importantes en las solicitudes de borrado.
5. Opcionalmente repetir el recorrido por terminal con `npx.cmd --yes newman run Postman/InventarioAA.postman_collection.json --timeout-request 15000`.

## Alcance y pendientes de entrega

- La creación de una base vacía en otro equipo no se ejecutó: se conservó y verificó la base existente del estudiante. El script portable requiere permisos CREATE DATABASE en la primera instalación.
- No se alteró el ejemplo PedidosRESTA ni el Angular de clientes que ocupa el puerto 4200.
- El inventario Angular utiliza 4201; CORS permite 4200/4201 para localhost y 127.0.0.1.
- Se conservaron las colecciones anteriores; la colección integrada nueva se entrega como archivo importable y fue ejecutada con Newman. No se afirma haberla importado en la aplicación de escritorio Postman.
- No se creó un sistema automático de ajuste de stock: Movimiento_Inventario conserva la lógica CRUD previa.
- Falta que el estudiante revise y publique los cambios en GitHub, grabe su explicación de hasta 5 minutos y entregue los enlaces en el aula. No se realizó commit, push ni entrega académica automática.
- El repositorio tenía modificaciones y carpetas previas (Actividad_Bloque_3, output, tmp) que no se eliminaron ni reorganizaron.

## Comprensión para la defensa

Angular no se conecta directamente a SQL Server. SOAP usa XML y SOAPAction; REST usa HTTP y JSON. El backend recibe la solicitud, valida los datos y las relaciones y usa Entity Framework Core para persistir. WSDL describe las operaciones y tipos del servicio SOAP. La API externa se consulta desde Angular y no modifica la base local.
