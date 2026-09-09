USE [InventarioSOAPDB];
GO

IF OBJECT_ID(N'dbo.Productos', N'U') IS NULL
BEGIN
    RAISERROR('Primero debe crear la tabla dbo.Productos.', 16, 1);
    RETURN;
END;
GO

IF OBJECT_ID(N'dbo.Movimiento_Inventario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimiento_Inventario
    (
        IdMovimiento INT IDENTITY(1,1) NOT NULL,
        IdProducto INT NOT NULL,
        TipoMovimiento NVARCHAR(20) NOT NULL,
        Cantidad INT NOT NULL,
        FechaMovimiento DATETIME2(0) NOT NULL
            CONSTRAINT DF_MovimientoInventario_Fecha DEFAULT (SYSDATETIME()),
        Observacion NVARCHAR(500) NULL,
        CONSTRAINT PK_MovimientoInventario PRIMARY KEY (IdMovimiento),
        CONSTRAINT FK_MovimientoInventario_Productos FOREIGN KEY (IdProducto)
            REFERENCES dbo.Productos (IdProducto),
        CONSTRAINT CK_MovimientoInventario_Tipo
            CHECK (UPPER(TipoMovimiento) IN (N'ENTRADA', N'SALIDA')),
        CONSTRAINT CK_MovimientoInventario_Cantidad CHECK (Cantidad > 0)
    );

    CREATE INDEX IX_MovimientoInventario_IdProducto
        ON dbo.Movimiento_Inventario (IdProducto);

    CREATE INDEX IX_MovimientoInventario_Fecha
        ON dbo.Movimiento_Inventario (FechaMovimiento);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Movimiento_Inventario)
BEGIN
    INSERT INTO dbo.Movimiento_Inventario
        (IdProducto, TipoMovimiento, Cantidad, FechaMovimiento, Observacion)
    VALUES
        (1, N'ENTRADA', 10, DATEADD(DAY, -3, SYSDATETIME()), N'Reposición inicial de producto.'),
        (3, N'SALIDA',   5, DATEADD(DAY, -2, SYSDATETIME()), N'Salida de inventario.'),
        (7, N'ENTRADA',  4, DATEADD(DAY, -1, SYSDATETIME()), N'Ingreso de accesorios.'),
        (2, N'SALIDA',   2, SYSDATETIME(),                  N'Salida registrada para pedido.');
END;
GO

SELECT *
FROM dbo.Movimiento_Inventario
ORDER BY IdMovimiento;
GO
