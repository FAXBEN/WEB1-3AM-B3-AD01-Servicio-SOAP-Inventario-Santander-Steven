# Origen Inventario — frontend Angular

Interfaz de Programación Web I, Tercero A Matutino. Reutiliza el backend InventarioSOAP_A: Categorías y Productos por SOAP; Movimiento_Inventario por REST; consulta pública de DummyJSON directamente desde Angular.

## Ejecutar

Requiere Node.js 24.15 o superior de la rama 24, npm y el backend en http://localhost:5163 con SQL Server disponible.

```powershell
npm.cmd ci
npm.cmd start
```

Abre http://localhost:4201. Se reservó este puerto para no interferir con el ejemplo ClientesSOAP en 4200. Abre esta carpeta en Visual Studio Code con `code .`.

## Organización

- `src/app/app.*`: resumen, tabla y formulario de productos.
- `src/app/features/categorias.ts`: gestión de categorías SOAP.
- `src/app/features/movimientos.ts`: lista/ID/alta/edición/baja REST.
- `src/app/features/catalogo-externo.ts`: búsqueda externa y comparación manual.
- `src/app/services/`: llamadas SOAP, REST y mensajes de error.
- `src/app/config/servicios.ts`: URL centralizadas.
- `src/app/Model/`: interfaces de las entidades.

Los cambios locales van al backend y SQL Server. El catálogo externo es de referencia; no importa datos ni convierte monedas. Los movimientos no recalculan Stock automáticamente.

## Verificación

```powershell
npm.cmd test -- --watch=false
npm.cmd run build
```

Las pruebas unitarias usan respuestas HTTP controladas; la prueba real contra SQL está en `scripts/ProbarIntegracion.ps1` del repositorio backend. Consulta allí el README, SQL/VerificarCambios.sql, Postman/InventarioAA.postman_collection.json y docs/GUIA_VIDEO.md.

La entrega incluye una copia de estas fuentes en `InventarioSOAP_A/FrontendAngular`. Si modificas la carpeta hermana original, ejecuta `scripts/SincronizarFrontend.ps1` desde el backend antes de subir a GitHub. No subas node_modules, dist, .angular ni secretos.
