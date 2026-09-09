# Inventario SOAP, REST y Angular

## Descripción

Proyecto desarrollado para la asignatura **Programación Web I**, correspondiente a **Tercero A Matutina de Desarrollo de software**.

El proyecto implementa un sistema de gestión de inventario utilizando servicios web SOAP para administrar categorías y productos, y un servicio REST para gestionar los movimientos de inventario. La información se almacena en SQL Server mediante Entity Framework Core.

La interfaz desarrollada en Angular permite consultar, registrar, actualizar y eliminar información. También integra una API pública de productos para consultar referencias y compararlas con el inventario local.

---

## Tecnologías utilizadas

- C#
- .NET 10
- SOAP y CoreWCF
- ASP.NET Core Web API y REST
- Entity Framework Core
- SQL Server
- Angular 22
- TypeScript, HTML y CSS
- RxJS y HttpClient
- API pública DummyJSON
- Postman
- Visual Studio Community
- Visual Studio Code

---

## Funcionalidades

### Categorías — SOAP

- Consultar las categorías registradas.
- Registrar una categoría.
- Actualizar su nombre, descripción y estado.
- Eliminar una categoría cuando no tenga productos asociados.

### Productos — SOAP

- Consultar todos los productos o buscar un producto por su identificador.
- Registrar, actualizar y eliminar productos.
- Filtrar productos por categoría y por rango de precios.
- Mostrar la categoría, precio, stock y estado de cada producto.
- Impedir la eliminación de productos que tengan movimientos relacionados.

### Movimientos de inventario — REST

- Obtener la lista de movimientos.
- Obtener un movimiento por su identificador.
- Registrar entradas y salidas asociadas a un producto.
- Actualizar y eliminar movimientos.
- Validar que el producto exista y que la cantidad sea un entero mayor que cero.

### Interfaz Angular

- Navegación entre resumen, productos, categorías, movimientos y catálogo externo.
- Formularios con validaciones y mensajes de éxito o error.
- Consulta de un catálogo público con imágenes e información de referencia.
- Comparación manual entre un producto externo y un producto local.

**Nota:** los movimientos registran entradas o salidas, pero no recalculan automáticamente el campo `Stock` de los productos. Se conserva la lógica del servicio REST del proyecto anterior.

---

## Estructura del proyecto

```text
InventarioSOAP_A/
├── InventarioSOAP_A/
│   ├── Controllers/
│   │   └── MovimientoInventarioController.cs
│   ├── Data/
│   │   └── InventarioDBContext.cs
│   ├── Models/
│   │   ├── Categoria.cs
│   │   ├── Producto.cs
│   │   └── MovimientoInventario.cs
│   ├── Services/
│   │   ├── ICatalogoService.cs
│   │   └── CatalogoService.cs
│   ├── appsettings.json
│   ├── InventarioSOAP_A.csproj
│   └── Program.cs
├── FrontendAngular/
│   ├── src/
│   │   └── app/
│   │       ├── Model/
│   │       ├── config/
│   │       ├── features/
│   │       └── services/
│   ├── angular.json
│   └── package.json
├── SQL/
│   ├── InstalarInventario.sql
│   ├── InventarioSOAPDB.sql
│   ├── Movimiento_Inventario.sql
│   └── VerificarCambios.sql
├── Postman/
│   ├── InventarioAA.postman_collection.json
│   ├── InventarioSOAP_A.postman_collection.json
│   └── InventarioREST.postman_collection.json
├── scripts/
│   ├── ProbarIntegracion.ps1
│   └── SincronizarFrontend.ps1
├── docs/
│   ├── GUIA_VIDEO.md
│   └── VERIFICACION_AA.md
├── InventarioSOAP_A.slnx
├── .gitignore
└── README.md
```

El servicio SOAP y el servicio REST se ejecutan dentro del mismo proyecto .NET. `FrontendAngular` contiene la aplicación Angular incluida en el repositorio para su entrega.

La carpeta de trabajo original de Angular es `../InventarioSOAP_A-app`. Si se realizan cambios allí, ejecutar `./scripts/SincronizarFrontend.ps1` desde la raíz de este repositorio para actualizar la copia de entrega.

---

## Base de datos

La base de datos se llama **InventarioSOAPDB** y contiene las siguientes tablas:

| Tabla | Campos principales | Función |
|---|---|---|
| `Categorias` | IdCategoria, Nombre, Descripcion, Estado | Clasificar los productos. |
| `Productos` | IdProducto, Nombre, Descripcion, Precio, Stock, Estado, IdCategoria | Almacenar el catálogo y sus existencias. |
| `Movimiento_Inventario` | IdMovimiento, IdProducto, TipoMovimiento, Cantidad, FechaMovimiento, Observacion | Registrar movimientos de cada producto. |

Una categoría puede tener varios productos. Un producto puede tener varios movimientos.

- `Productos.IdCategoria` es clave foránea de `Categorias.IdCategoria`.
- `Movimiento_Inventario.IdProducto` es clave foránea de `Productos.IdProducto`.
- Las claves foráneas evitan eliminar registros que todavía tengan información relacionada.

### Crear la base de datos

1. Abrir SQL Server Management Studio.
2. Conectarse a la instancia de SQL Server que se utilizará.
3. Abrir [SQL/InstalarInventario.sql](SQL/InstalarInventario.sql).
4. Ejecutar el archivo completo.
5. Actualizar el explorador de objetos y comprobar las tablas de `InventarioSOAPDB`.

El script crea la base y las tablas cuando no existen, agrega datos mínimos cuando el catálogo está vacío y conserva los registros existentes. La primera instalación requiere permisos para crear una base de datos.

También puede ejecutarse desde la raíz del repositorio con `sqlcmd`:

```powershell
sqlcmd -S localhost -E -C -b -f 65001 -i SQL/InstalarInventario.sql
```

El archivo `InventarioSOAPDB.sql` se conserva como exportación del trabajo anterior. Para instalar en otro equipo se recomienda `InstalarInventario.sql`, que no depende de usuarios específicos de Windows.

---

## Requisitos de ejecución

- Windows y una instancia de SQL Server disponible.
- .NET SDK 10.
- Node.js 24, versión 24.15 o posterior, y npm.
- Acceso a Internet para restaurar dependencias y consultar la API externa.
- Visual Studio Community para trabajar con el backend y Visual Studio Code para Angular.
- Postman para probar los servicios.
- SQL Server Management Studio para ejecutar los scripts y consultar los datos.

La cuenta de Windows que ejecuta el backend debe tener permisos de lectura y escritura en `InventarioSOAPDB`.

---

## Configuración de la conexión

La conexión se configura en `InventarioSOAP_A/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "InventarioConnection": "Server=localhost;Database=InventarioSOAPDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

- `Server`: instancia de SQL Server.
- `Database`: nombre de la base de datos.
- `Trusted_Connection=True`: utiliza la cuenta de Windows.
- `TrustServerCertificate=True`: configuración de confianza del certificado para este entorno local de desarrollo; no debe trasladarse sin revisión a producción.

Si se utiliza otra instancia, se debe ajustar `Server`. No publicar contraseñas, credenciales reales ni claves privadas en el repositorio.

Las URL utilizadas por Angular se encuentran en `src/app/config/servicios.ts`, dentro de la carpeta del frontend.

---

## Ejecución de los servicios SOAP y REST

### Desde Visual Studio Community

1. Abrir `InventarioSOAP_A.slnx`.
2. Restaurar los paquetes NuGet.
3. Verificar la conexión con SQL Server.
4. Ejecutar el proyecto con el perfil **http**.

Ambos servicios se inician juntos en el puerto **5163**.

### Desde la terminal

Ejecutar desde la raíz del repositorio:

```powershell
dotnet restore InventarioSOAP_A/InventarioSOAP_A.csproj
dotnet run --project InventarioSOAP_A/InventarioSOAP_A.csproj
```

| Recurso | Dirección |
|---|---|
| Servicio SOAP | http://localhost:5163/CatalogoService.svc |
| Documento WSDL | http://localhost:5163/CatalogoService.svc?wsdl |
| Servicio REST | http://localhost:5163/api/MovimientoInventario |

El WSDL describe las operaciones, los tipos de datos y la dirección del servicio SOAP. Abrir la dirección REST en el navegador permite consultar la lista de movimientos en formato JSON.

Si aparece un error indicando que el puerto está ocupado, comprobar si el backend ya está ejecutándose. No iniciar dos instancias en el mismo puerto.

---

## Ejecución de Angular

Abrir una segunda terminal desde la raíz del repositorio:

```powershell
cd FrontendAngular
npm.cmd ci
npm.cmd start
```

Abrir la aplicación en **http://localhost:4201**.

También se pueden ejecutar `npm.cmd ci` y `npm.cmd start` desde la carpeta original `InventarioSOAP_A-app`. No es necesario iniciar ambas copias.

El puerto 4201 permite mantener separado el inventario del ejemplo de clientes que utiliza 4200. La configuración CORS del backend permite los orígenes `localhost` y `127.0.0.1` en los puertos 4200 y 4201. Si cambian las URL o los puertos, se deben actualizar la configuración de Angular y la política CORS en `Program.cs`.

---

## Operaciones SOAP

Todas las operaciones se envían mediante `POST` a `/CatalogoService.svc`, con un cuerpo XML y el encabezado `SOAPAction` correspondiente.

| Operación | Descripción |
|---|---|
| `ObtenerCategorias` | Consultar todas las categorías. |
| `AgregarCategoria` | Registrar una categoría. |
| `ActualizarCategoria` | Actualizar una categoría. |
| `EliminarCategoria` | Eliminar una categoría sin productos asociados. |
| `ObtenerProductos` | Consultar todos los productos. |
| `ObtenerProducto` | Buscar un producto por ID. |
| `AgregarProducto` | Registrar un producto. |
| `ActualizarProducto` | Actualizar un producto. |
| `EliminarProducto` | Eliminar un producto sin movimientos asociados. |
| `ObtenerProductosPorPrecio` | Consultar productos dentro de un rango de precios. |
| `ObtenerProductosPorCategoria` | Consultar productos de una categoría. |

Ejemplo para consultar categorías:

```http
POST http://localhost:5163/CatalogoService.svc
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://tempuri.org/ICatalogoService/ObtenerCategorias"
```

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:ObtenerCategorias />
  </soap:Body>
</soap:Envelope>
```

---

## Operaciones REST

Dirección base: `http://localhost:5163/api/MovimientoInventario`.

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/api/MovimientoInventario` | Obtener todos los movimientos. |
| `GET` | `/api/MovimientoInventario/{id}` | Obtener un movimiento. |
| `POST` | `/api/MovimientoInventario` | Guardar un movimiento. |
| `PUT` | `/api/MovimientoInventario/{id}` | Actualizar un movimiento. |
| `DELETE` | `/api/MovimientoInventario/{id}` | Eliminar un movimiento. |

Para registrar o actualizar se utiliza `Content-Type: application/json`. Ejemplo de cuerpo:

```json
{
  "idProducto": 1,
  "tipoMovimiento": "ENTRADA",
  "cantidad": 5,
  "fechaMovimiento": "2026-09-08T10:30:00",
  "observacion": "Ingreso de productos al inventario"
}
```

Antes de enviarlo, reemplazar `idProducto` por el ID de un producto existente. El tipo de movimiento debe ser `ENTRADA` o `SALIDA`.

Respuestas principales: `200` para consultas, `201` para creación, `204` para actualización o eliminación, `400` para datos inválidos y `404` cuando no existe el registro solicitado.

---

## Pruebas con Postman

La colección integrada es [InventarioAA.postman_collection.json](Postman/InventarioAA.postman_collection.json).

1. Iniciar el backend y verificar que la base de datos esté disponible.
2. Abrir Postman y seleccionar **Import**.
3. Importar el archivo de la colección.
4. Abrir **InventarioAA**.
5. Comprobar que la variable `baseUrl` tenga el valor `http://localhost:5163`.
6. Ejecutar el recorrido en orden, comenzando por **AgregarCategoria**.

La colección guarda los ID generados en las variables `categoriaId`, `productoId` y `movimientoId`. Las solicitudes posteriores utilizan esos valores para consultar, actualizar y eliminar los registros de prueba.

**Importante:** las últimas operaciones eliminan los registros creados durante el recorrido. No sustituir sus ID por los de información que se desee conservar. Si se interrumpe la prueba, revisar los registros temporales antes de repetirla.

También se conservan las colecciones anteriores `InventarioSOAP_A` e `InventarioREST`.

---

## API externa

Se utiliza **DummyJSON**, una API pública con datos de demostración de productos.

La consulta se realiza directamente desde Angular mediante `HttpClient` y se presenta en la pantalla **Catálogo externo**.

| Consulta | Endpoint |
|---|---|
| Alimentos | `https://dummyjson.com/products/category/groceries?limit=12` |
| Búsqueda por nombre | `https://dummyjson.com/products/search?q=apple&limit=12` |

La pantalla muestra el nombre, categoría, descripción, precio e imagen de los productos recibidos. El botón **Comparar con mi inventario** permite seleccionar un producto local y visualizar sus datos junto a los de la referencia externa.

Se manejan los estados de carga, respuesta correcta, error de conexión y ausencia de resultados. La información externa no se guarda en SQL Server, no reemplaza los servicios propios y no se utiliza para convertir monedas o asumir equivalencias entre productos.

Documentación: [DummyJSON Products](https://dummyjson.com/docs/products).

---

## Flujo de funcionamiento

1. El usuario realiza una acción en Angular o envía una solicitud desde Postman.
2. Las operaciones de categorías y productos llegan al servicio SOAP en formato XML.
3. Las operaciones de movimientos llegan al controlador REST en formato JSON.
4. El backend valida los datos y sus relaciones.
5. Entity Framework Core consulta SQL Server o guarda los cambios mediante `SaveChanges()` / `SaveChangesAsync()`.
6. El servicio devuelve la respuesta y Angular actualiza la información visible.

La consulta a DummyJSON es independiente: Angular envía una solicitud HTTP a la API pública y muestra su respuesta, sin modificar la base de datos local.

### Verificar los cambios en SQL Server

Abrir [SQL/VerificarCambios.sql](SQL/VerificarCambios.sql) en SQL Server Management Studio y ejecutarlo después de registrar, actualizar o eliminar información. Pulsar **F5** nuevamente después de cada cambio: los resultados no se actualizan solos.

---

## Verificación y documentación adicional

Desde la carpeta Angular:

```powershell
npm.cmd test -- --watch=false
npm.cmd run build
```

Desde la raíz del repositorio, con el backend iniciado y `sqlcmd` disponible:

```powershell
./scripts/ProbarIntegracion.ps1
```

La prueba de integración crea registros temporales, comprueba los servicios y la persistencia en SQL Server, y elimina sus propios registros al terminar.

- [Resultados de verificación](docs/VERIFICACION_AA.md).
- [Guion para la demostración de máximo cinco minutos](docs/GUIA_VIDEO.md).

El archivo `.gitignore` excluye dependencias y archivos generados, como `bin`, `obj`, `node_modules`, `dist` y cachés. Antes de publicar, revisar que no existan contraseñas ni claves privadas.

---

## Autor

**Steven Fabián Santander Montoya**

Tercero A Matutina  
Desarrollo de software.
