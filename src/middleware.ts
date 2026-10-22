import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Solo interceptamos las rutas de imágenes optimizadas
  if (url.pathname.startsWith('/linkni-opt') || url.pathname.startsWith('/_next/image')) {
    const referer = request.headers.get('referer');
    const fetchDest = request.headers.get('sec-fetch-dest');
    
    // Si la petición no es incrustada como imagen (ej. pegada en el navegador) 
    // o no tiene tu dominio como origen, la bloqueamos.
    if (
      !referer || 
      fetchDest === 'document' || 
      (!referer.includes('localhost') && !referer.includes('linkni.mx'))
    ) {
      return new NextResponse('Acceso denegado. Este activo está protegido por Linkni.', { status: 403 });
    }
  }
  
  return NextResponse.next();
}

// Opcional pero recomendado: Limitar el middleware para que no procese todas las rutas del sitio
export const config = {
  matcher: ['/linkni-opt', '/_next/image'],
};