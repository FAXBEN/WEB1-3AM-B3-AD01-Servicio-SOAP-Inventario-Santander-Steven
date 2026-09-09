# Guion del video — máximo 5 minutos

Explica con tus propias palabras lo que entiendes del proyecto. No basta con leer este guion o mostrar código sin ejecutar. Ten abiertos Angular (4201), el backend (5163), SSMS y Postman antes de grabar.

## 0:00–0:25 · Presentación

Indica tu nombre, asignatura y paralelo Tercero A Matutino. Presenta el sistema de inventario: Categoría y Producto por SOAP, MovimientoInventario por REST y catálogo público desde Angular. Muestra brevemente la relación uno a muchos entre las tres tablas.

## 0:25–1:40 · SOAP desde Angular

En Categorías crea una categoría de demostración. En Productos crea un producto usando esa categoría, consulta su ID y edita el precio. Explica que Angular construye un sobre XML, envía POST con SOAPAction al servicio .svc y lee el XML de respuesta. CoreWCF ejecuta CatalogoService y Entity Framework usa SaveChanges para persistir.

Muestra en SSMS la consulta de productos y categorías del archivo SQL/VerificarCambios.sql. Pulsa F5: deben verse el nombre y precio recién guardados. No uses registros importantes para la demostración.

## 1:40–2:55 · REST desde Angular

En Movimientos registra una ENTRADA vinculada al producto de prueba. Consulta el ID generado, cambia la cantidad y comprueba la modificación en SQL con F5. Explica GET lista/ID, POST creación, PUT actualización y DELETE eliminación; el cuerpo es JSON y los códigos habituales son 200, 201, 204, 400 y 404.

Aclara la regla del sistema actual: el movimiento registra una entrada o salida pero no modifica automáticamente el campo Stock del producto. Muestra la validación de cantidad positiva y la relación IdProducto.

## 2:55–3:50 · API pública

En Catálogo externo pulsa Ver alimentos o busca apple. Muestra imágenes/nombres recibidos y compara una referencia con el producto local. Explica que HttpClient consulta DummyJSON directamente, son datos de demostración y no se guardan en SQL. No hay conversión de moneda ni equivalencia automática de productos.

Haz una búsqueda como zzzsincoincidenciaaaa para mostrar el mensaje sin resultados. Explica que un fallo de red muestra un error y permite reintentar. Si demuestras el fallo con DevTools, usa solo la opción de red del navegador, sin cambiar seguridad del sistema.

## 3:50–4:40 · Eliminación y Postman

Elimina solo el movimiento, producto y categoría que creaste en esta demostración, en ese orden. Actualiza las consultas SQL para demostrarlo. Explica que no se puede borrar una categoría con productos ni un producto con movimientos.

En Postman muestra la colección InventarioAA y distingue el sobre SOAP del JSON REST. Si prefieres, ejecuta una consulta GET y ObtenerCategorias. El WSDL describe el contrato SOAP; REST no requiere ese WSDL.

## 4:40–5:00 · Cierre

Muestra el README, las URL, las carpetas del repositorio y resume cómo se conectan las partes. Indica qué validaciones hiciste y cómo revisaste los cambios en SQL Server.

## Lista de entrega

- Revisar el nombre y paralelo en la presentación.
- Sincronizar las fuentes Angular con scripts/SincronizarFrontend.ps1 si editaste la carpeta hermana.
- Revisar que GitHub incluya FrontendAngular, InventarioSOAP_A, SQL, Postman, README y docs, sin secretos ni bin/obj/node_modules.
- Subir los cambios al repositorio y comprobar el enlace desde otra ventana.
- Grabar un video de cinco minutos o menos con tu explicación y evidencia real.
- Subir o adjuntar el video según el aula y verificar que el docente tenga acceso.
- Entregar los enlaces de repositorio y video en el aula antes del plazo del PDF (09/09/2026, 23:59).

El video de entrega está en [docs/video/AA_Programacion_Web_I_Santander_Steven.mp4](video/AA_Programacion_Web_I_Santander_Steven.mp4). El repositorio ya incluye frontend, SQL, Postman y este video. Falta pegar ambos enlaces en el aula/Teams.
