-- Instalación portable: no elimina datos ni crea usuarios ligados a un equipo.
-- En SSMS ejecutar todo el archivo. En terminal: sqlcmd -S localhost -E -C -b -f 65001 -i SQL/InstalarInventario.sql
USE master;
GO
IF DB_ID(N'InventarioSOAPDB') IS NULL
    EXEC(N'CREATE DATABASE InventarioSOAPDB');
GO
USE InventarioSOAPDB;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'dbo.Categorias', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categorias (
        IdCategoria INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        Estado BIT NOT NULL
    );
END;
IF OBJECT_ID(N'dbo.Productos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos (
        IdProducto INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Stock INT NOT NULL,
        Estado BIT NOT NULL,
        IdCategoria INT NOT NULL,
        CONSTRAINT FK_Productos_Categorias FOREIGN KEY(IdCategoria) REFERENCES dbo.Categorias(IdCategoria)
    );
    CREATE INDEX IX_Productos_IdCategoria ON dbo.Productos(IdCategoria);
END;
IF OBJECT_ID(N'dbo.Movimiento_Inventario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimiento_Inventario (
        IdMovimiento INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        IdProducto INT NOT NULL,
        TipoMovimiento NVARCHAR(20) NOT NULL,
        Cantidad INT NOT NULL,
        FechaMovimiento DATETIME2(0) NOT NULL CONSTRAINT DF_MovimientoInventario_Fecha DEFAULT(SYSDATETIME()),
        Observacion NVARCHAR(500) NULL,
        CONSTRAINT FK_MovimientoInventario_Productos FOREIGN KEY(IdProducto) REFERENCES dbo.Productos(IdProducto),
        CONSTRAINT CK_MovimientoInventario_Tipo CHECK(UPPER(TipoMovimiento) IN (N'ENTRADA', N'SALIDA')),
        CONSTRAINT CK_MovimientoInventario_Cantidad CHECK(Cantidad > 0)
    );
    CREATE INDEX IX_MovimientoInventario_IdProducto ON dbo.Movimiento_Inventario(IdProducto);
    CREATE INDEX IX_MovimientoInventario_Fecha ON dbo.Movimiento_Inventario(FechaMovimiento);
END;
-- Datos de ejemplo solamente si el catálogo completo está vacío.
IF NOT EXISTS(SELECT 1 FROM dbo.Categorias) AND NOT EXISTS(SELECT 1 FROM dbo.Productos)
BEGIN
    INSERT dbo.Categorias(Nombre, Descripcion, Estado) VALUES(N'Alimentos', N'Productos de alimentación', 1);
    DECLARE @categoria INT = CONVERT(INT, SCOPE_IDENTITY());
    INSERT dbo.Productos(Nombre, Descripcion, Precio, Stock, Estado, IdCategoria)
    VALUES(N'Manzana', N'Fruta fresca', 1.50, 20, 1, @categoria),
          (N'Café', N'Café molido', 5.50, 12, 1, @categoria);
    DECLARE @producto INT = CONVERT(INT, SCOPE_IDENTITY());
    INSERT dbo.Movimiento_Inventario(IdProducto, TipoMovimiento, Cantidad, Observacion)
    VALUES(@producto, N'ENTRADA', 12, N'Ejemplo académico; no modifica automáticamente Stock');
END;
COMMIT;
GO
SELECT 'Instalación finalizada; se conservaron los datos existentes.' AS Resultado;
