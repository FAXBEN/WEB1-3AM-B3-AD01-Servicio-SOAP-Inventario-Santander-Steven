# Inventario SOAP

## Descripción

Proyecto desarrollado para la asignatura **Programación Web I**.

El proyecto implementa un servicio web SOAP para la gestión de un inventario de productos y categorías utilizando .NET, Entity Framework Core y SQL Server.

El servicio permite realizar operaciones de consulta, registro, actualización y eliminación de productos. También permite consultar productos por identificador, categoría y rango de precios.

---

## Tecnologías utilizadas

- C#
- .NET 10
- SOAP
- CoreWCF
- Entity Framework Core
- SQL Server
- Postman
- Visual Studio Community

---

## Funcionalidades

- Consultar todas las categorías.
- Consultar todos los productos.
- Consultar un producto por su identificador.
- Registrar un producto nuevo.
- Actualizar la información de un producto.
- Eliminar un producto.
- Filtrar productos por categoría.
- Filtrar productos por rango de precios.
- Validar que la categoría de un producto exista.

---

## Estructura del proyecto

```text
InventarioSOAP_A/
├── Database/
│   └── InventarioSOAPDB.sql
├── InventarioSOAP_A/
│   ├── Data/
│   │   └── InventarioDBContext.cs
│   ├── Models/
│   │   ├── Categoria.cs
│   │   └── Producto.cs
│   ├── Services/
│   │   ├── ICatalogoService.cs
│   │   └── CatalogoService.cs
│   ├── appsettings.json
│   ├── InventarioSOAP_A.csproj
│   └── Program.cs
├── Postman/
│   └── InventarioSOAP_A.postman_collection.json
├── InventarioSOAP_A.slnx
└── README.md
```

---

## Base de datos

La base de datos utilizada es **InventarioSOAPDB** y contiene las siguientes tablas:

- `Categorias`: almacena las categorías disponibles.
- `Productos`: almacena los productos del inventario.

Cada producto se relaciona con una categoría mediante el campo `IdCategoria`.

El script para crear la base de datos, sus tablas y los datos iniciales se encuentra en:

```text
Database/InventarioSOAPDB.sql
```

### Creación de la base de datos

1. Abrir SQL Server Management Studio.
2. Conectarse al servidor local de SQL Server.
3. Abrir el archivo `Database/InventarioSOAPDB.sql`.
4. Ejecutar completamente el script.
5. Actualizar el explorador de objetos y verificar que aparezca `InventarioSOAPDB`.

---

## Configuración de la conexión

Antes de ejecutar debe revisar la cadena de conexión ubicada en:

La conexión con SQL Server se configura en `InventarioSOAP_A/appsettings.json` mediante la cadena `InventarioConnection`:

La cadena de conexión debe modificarse de acuerdo con la configuración local de SQL Server del equipo donde se ejecuta el proyecto:
```json
{
  "ConnectionStrings": {
    "InventarioConnection": "Server=localhost;Database=InventarioSOAPDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

La opción `Trusted_Connection=True` indica que la aplicación utiliza la cuenta de Windows para conectarse a SQL Server.

---


## Ejecución del servicio

1. Abrir `InventarioSOAP_A.slnx` en Visual Studio Community.
2. Restaurar los paquetes NuGet si Visual Studio lo solicita.
3. Verificar que SQL Server esté iniciado y que exista la base de datos `InventarioSOAPDB`.
4. Ejecutar el proyecto utilizando el perfil **http**.
5. Comprobar que el servicio se encuentre disponible en:

```text
http://localhost:5163/CatalogoService.svc
```

El documento WSDL se puede consultar en:

```text
http://localhost:5163/CatalogoService.svc?wsdl
```

---

## Operaciones SOAP

| Operación | Descripción |
|---|---|
| `ObtenerCategorias` | Consulta todas las categorías. |
| `ObtenerProductos` | Consulta todos los productos. |
| `ObtenerProducto` | Consulta un producto por su ID. |
| `AgregarProducto` | Registra un producto nuevo. |
| `ActualizarProducto` | Modifica un producto existente. |
| `EliminarProducto` | Elimina un producto por su ID. |
| `ObtenerProductosPorPrecio` | Filtra los productos por precio mínimo y máximo. |
| `ObtenerProductosPorCategoria` | Filtra los productos por categoría. |

---

## Pruebas con Postman

El proyecto incluye una colección con todas las solicitudes necesarias para probar el servicio:

```text
Postman/InventarioSOAP_A.postman_collection.json
```

### Importar la colección

1. Ejecutar primero el servicio desde Visual Studio.
2. Abrir Postman.
3. Seleccionar **Import**.
4. Seleccionar el archivo `InventarioSOAP_A.postman_collection.json`.
5. Abrir la colección **InventarioSOAP_A**.
6. Ejecutar cualquiera de las operaciones SOAP.

Las solicitudes utilizan:

```text
POST http://localhost:5163/CatalogoService.svc
Content-Type: text/xml; charset=utf-8
```

Cuando se ejecuta una operación de registro, actualización o eliminación, el servicio utiliza Entity Framework Core y `SaveChanges()` para guardar el cambio en `InventarioSOAPDB`.

---

## Flujo de funcionamiento

```text
Postman
   ↓ Solicitud XML SOAP
CatalogoService.svc
   ↓
CatalogoService
   ↓
Entity Framework Core
   ↓
SQL Server - InventarioSOAPDB
```

El servicio recibe el mensaje XML, ejecuta la operación solicitada, consulta o modifica la base de datos y devuelve una respuesta SOAP en formato XML.

Autor
Estudiante: Steven Fabián Santander Montoya
Asignatura: Programación Web
Paralelo: Tercero A Matutina
