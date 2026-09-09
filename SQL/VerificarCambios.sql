USE InventarioSOAPDB;
GO
SELECT IdCategoria, Nombre, Descripcion, Estado FROM dbo.Categorias ORDER BY IdCategoria DESC;
SELECT p.IdProducto, p.Nombre, p.Precio, p.Stock, p.Estado,
       c.IdCategoria, c.Nombre AS Categoria
FROM dbo.Productos p INNER JOIN dbo.Categorias c ON c.IdCategoria = p.IdCategoria
ORDER BY p.IdProducto DESC;
SELECT m.IdMovimiento, p.IdProducto, p.Nombre AS Producto, c.Nombre AS Categoria,
       m.TipoMovimiento, m.Cantidad, m.FechaMovimiento, m.Observacion
FROM dbo.Movimiento_Inventario m
INNER JOIN dbo.Productos p ON p.IdProducto = m.IdProducto
INNER JOIN dbo.Categorias c ON c.IdCategoria = p.IdCategoria
ORDER BY m.IdMovimiento DESC;
-- Después de cada operación en Angular o Postman, vuelve a ejecutar (F5).
