param([string]$BaseUrl = 'http://localhost:5163', [string]$ServidorSql = 'localhost')
$ErrorActionPreference = 'Stop'
# Usa únicamente registros nuevos de prueba. Finalmente los elimina por sus IDs.
function Soap([string]$Operacion, [string]$Contenido) {
    $xml = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:t="http://tempuri.org/" xmlns:i="http://schemas.datacontract.org/2004/07/InventarioSOAP_A.Models"><s:Body>' + $Contenido + '</s:Body></s:Envelope>'
    $respuesta = Invoke-WebRequest -Uri "$BaseUrl/CatalogoService.svc" -Method Post -ContentType 'text/xml; charset=utf-8' -Headers @{SOAPAction = '"http://tempuri.org/ICatalogoService/' + $Operacion + '"'} -Body ([Text.Encoding]::UTF8.GetBytes($xml))
    return [xml]$respuesta.Content
}
function Valor($Xml, [string]$Nombre) { return $Xml.SelectSingleNode("//*[local-name()='$Nombre']").InnerText }
function Exigir([bool]$Condicion, [string]$Mensaje) { if (!$Condicion) { throw $Mensaje }; Write-Output "OK: $Mensaje" }
$categoriaId = 0; $productoId = 0; $movimientoId = 0
$marca = 'PruebaAA_' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
try {
    $cors = Invoke-WebRequest "$BaseUrl/api/MovimientoInventario" -Method Options -Headers @{Origin='http://localhost:4201'; 'Access-Control-Request-Method'='POST'; 'Access-Control-Request-Headers'='content-type'}
    Exigir (($cors.Headers['Access-Control-Allow-Origin'] -join '') -eq 'http://localhost:4201') 'CORS permite Angular en 4201'
    $wsdl = Invoke-WebRequest "$BaseUrl/CatalogoService.svc?wsdl"
    Exigir ($wsdl.Content.Contains('AgregarCategoria')) 'WSDL publica las nuevas operaciones SOAP'
    $campos = "<i:Descripcion>Verificacion temporal</i:Descripcion><i:Estado>true</i:Estado><i:IdCategoria>0</i:IdCategoria><i:Nombre>$marca</i:Nombre>"
    $r = Soap 'AgregarCategoria' "<t:AgregarCategoria><t:categoria>$campos</t:categoria></t:AgregarCategoria>"
    $categoriaId = [int](Valor $r 'IdCategoria')
    Exigir ($categoriaId -gt 0) 'SOAP crea categoria'
    $campos = "<i:Descripcion>Verificacion temporal</i:Descripcion><i:Estado>true</i:Estado><i:IdCategoria>$categoriaId</i:IdCategoria><i:Nombre>${marca}_editada</i:Nombre>"
    $r = Soap 'ActualizarCategoria' "<t:ActualizarCategoria><t:categoria>$campos</t:categoria></t:ActualizarCategoria>"
    Exigir ((Valor $r 'Nombre') -eq "${marca}_editada") 'SOAP actualiza categoria'
    $campos = "<i:Descripcion>Producto temporal</i:Descripcion><i:Estado>true</i:Estado><i:IdCategoria>$categoriaId</i:IdCategoria><i:IdProducto>0</i:IdProducto><i:Nombre>$marca</i:Nombre><i:Precio>12.50</i:Precio><i:Stock>10</i:Stock>"
    $r = Soap 'AgregarProducto' "<t:AgregarProducto><t:producto>$campos</t:producto></t:AgregarProducto>"
    $productoId = [int](Valor $r 'IdProducto')
    Exigir ($productoId -gt 0) 'SOAP crea producto relacionado'
    $campos = $campos.Replace('<i:IdProducto>0</i:IdProducto>', "<i:IdProducto>$productoId</i:IdProducto>").Replace('<i:Precio>12.50</i:Precio>', '<i:Precio>14.25</i:Precio>')
    $r = Soap 'ActualizarProducto' "<t:ActualizarProducto><t:producto>$campos</t:producto></t:ActualizarProducto>"
    Exigir ([decimal](Valor $r 'Precio') -eq 14.25) 'SOAP actualiza producto'
    $datos = @{ idProducto=$productoId; tipoMovimiento='ENTRADA'; cantidad=2; fechaMovimiento='2026-09-08T10:30:00'; observacion=$marca }
    $r = Invoke-WebRequest "$BaseUrl/api/MovimientoInventario" -Method Post -ContentType 'application/json' -Body ($datos | ConvertTo-Json)
    $movimientoId = [int](($r.Content | ConvertFrom-Json).idMovimiento)
    Exigir ($r.StatusCode -eq 201 -and $movimientoId -gt 0) 'REST POST devuelve 201 e ID nuevo'
    $datos.cantidad = 3
    $r = Invoke-WebRequest "$BaseUrl/api/MovimientoInventario/$movimientoId" -Method Put -ContentType 'application/json' -Body ($datos | ConvertTo-Json)
    Exigir ($r.StatusCode -eq 204) 'REST PUT devuelve 204'
    $r = Invoke-RestMethod "$BaseUrl/api/MovimientoInventario/$movimientoId"
    Exigir ($r.cantidad -eq 3) 'REST GET por ID recupera cambio persistido'
    $lista = Invoke-RestMethod "$BaseUrl/api/MovimientoInventario"
    Exigir (@($lista | Where-Object idMovimiento -eq $movimientoId).Count -eq 1) 'REST lista incluye el movimiento'
    $sql = "SET NOCOUNT ON; SELECT CONCAT(c.Nombre,'|',p.Precio,'|',m.Cantidad) FROM Movimiento_Inventario m JOIN Productos p ON m.IdProducto=p.IdProducto JOIN Categorias c ON p.IdCategoria=c.IdCategoria WHERE m.IdMovimiento=$movimientoId;"
    $resultado = (& sqlcmd -S $ServidorSql -E -C -b -d InventarioSOAPDB -h -1 -W -Q $sql) -join ''
    Exigir ($LASTEXITCODE -eq 0 -and $resultado.Trim() -eq "${marca}_editada|14.25|3") 'SQL Server confirma categoria, precio y cantidad actualizados'
    try { Soap 'EliminarProducto' "<t:EliminarProducto><t:id>$productoId</t:id></t:EliminarProducto>" | Out-Null; throw 'No se bloqueo el producto relacionado' }
    catch { Exigir ($_.Exception.Response.StatusCode.value__ -eq 500) 'SOAP impide borrar producto con movimientos' }
    try { Soap 'EliminarCategoria' "<t:EliminarCategoria><t:id>$categoriaId</t:id></t:EliminarCategoria>" | Out-Null; throw 'No se bloqueo la categoria relacionada' }
    catch { Exigir ($_.Exception.Response.StatusCode.value__ -eq 500) 'SOAP impide borrar categoria con productos' }
    $datos.cantidad = 0
    try { Invoke-WebRequest "$BaseUrl/api/MovimientoInventario" -Method Post -ContentType 'application/json' -Body ($datos | ConvertTo-Json) | Out-Null; throw 'Acepto cantidad cero' }
    catch { Exigir ($_.Exception.Response.StatusCode.value__ -eq 400) 'REST rechaza cantidad cero con 400' }
    $r = Invoke-WebRequest "$BaseUrl/api/MovimientoInventario/$movimientoId" -Method Delete
    Exigir ($r.StatusCode -eq 204) 'REST DELETE devuelve 204'
    try { Invoke-WebRequest "$BaseUrl/api/MovimientoInventario/$movimientoId" | Out-Null; throw 'Sigue existiendo' }
    catch { Exigir ($_.Exception.Response.StatusCode.value__ -eq 404) 'REST devuelve 404 tras eliminar' }
    $movimientoId = 0
    $r = Soap 'EliminarProducto' "<t:EliminarProducto><t:id>$productoId</t:id></t:EliminarProducto>"
    Exigir ((Valor $r 'EliminarProductoResult') -eq 'true') 'SOAP elimina producto temporal'; $productoId = 0
    $r = Soap 'EliminarCategoria' "<t:EliminarCategoria><t:id>$categoriaId</t:id></t:EliminarCategoria>"
    Exigir ((Valor $r 'EliminarCategoriaResult') -eq 'true') 'SOAP elimina categoria temporal'; $categoriaId = 0
    Write-Output 'PRUEBA COMPLETA CORRECTA. No se modificaron registros previos.'
} finally {
    if ($movimientoId -gt 0) { Invoke-RestMethod "$BaseUrl/api/MovimientoInventario/$movimientoId" -Method Delete }
    if ($productoId -gt 0) { Soap 'EliminarProducto' "<t:EliminarProducto><t:id>$productoId</t:id></t:EliminarProducto>" | Out-Null }
    if ($categoriaId -gt 0) { Soap 'EliminarCategoria' "<t:EliminarCategoria><t:id>$categoriaId</t:id></t:EliminarCategoria>" | Out-Null }
}
