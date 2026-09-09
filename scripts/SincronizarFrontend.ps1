param([string]$Origen = (Join-Path (Split-Path $PSScriptRoot -Parent) '..\InventarioSOAP_A-app'))
$ErrorActionPreference = 'Stop'
$repositorio = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$fuente = (Resolve-Path -LiteralPath $Origen).Path
$destino = Join-Path $repositorio 'FrontendAngular'
if (!(Test-Path -LiteralPath (Join-Path $fuente 'angular.json'))) { throw 'El origen no es el proyecto Angular.' }
if ($fuente -eq $destino) { throw 'Origen y destino no pueden ser iguales.' }
New-Item -ItemType Directory -Path $destino -Force | Out-Null
# Copia mecánica del código. No borra archivos ni copia secretos/dependencias.
foreach ($carpeta in @('src', 'public')) {
    Copy-Item -LiteralPath (Join-Path $fuente $carpeta) -Destination $destino -Recurse -Force
}
foreach ($archivo in @('angular.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json', '.editorconfig', '.gitignore', 'README.md')) {
    $ruta = Join-Path $fuente $archivo
    if (Test-Path -LiteralPath $ruta) { Copy-Item -LiteralPath $ruta -Destination (Join-Path $destino $archivo) -Force }
}
Write-Output "Frontend actualizado en $destino. Revisa git diff antes de publicar."
