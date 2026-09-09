import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar. Revisa el servicio, tu conexión y la configuración CORS.';
    if (typeof error.error === 'string') {
      const xml = new DOMParser().parseFromString(error.error, 'text/xml');
      const fault = xml.getElementsByTagNameNS('*', 'faultstring')[0]?.textContent;
      if (fault) return fault;
    }
    if (error.error?.mensaje) return error.error.mensaje;
    if (error.error?.errors) return Object.values(error.error.errors).flat().join(' ');
    if (error.status === 404) return 'No se encontró el registro solicitado.';
    return `El servicio no pudo completar la solicitud (HTTP ${error.status}).`;
  }
  return error instanceof Error && error.name === 'TimeoutError'
    ? 'El servicio tardó demasiado. Intenta nuevamente.'
    : 'No se pudo completar la operación. Intenta nuevamente.';
}
