import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');

    // 1. Capa de Defensa Anti-Hotlinking
    const referer = request.headers.get('referer');
    if (referer && !referer.includes('localhost') && !referer.includes('linkni.mx') && !referer.includes('vercel.app')) {
      return new NextResponse('Hotlinking denegado por seguridad', { status: 403 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new NextResponse('Falta configuración de entorno', { status: 500 });
    }

    // 2. Conexión AUTENTICADA (Obligatorio porque tu bucket es Privado)
    const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/authenticated/${filePath}`;

    // 3. Petición con tu Llave Maestra (Service Role Key)
    const response = await fetch(supabaseUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error Supabase [${response.status}]: ${filePath}`);
      return new NextResponse(`Archivo no encontrado o sin permisos: ${filePath}`, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    // 4. FORZADO EXTREMO DEL TIPO DE ARCHIVO (Para que Next.js la comprima y no se descargue)
    let contentType = 'image/jpeg'; 
    const fileName = filePath.split('/').pop() || 'imagen.jpg';
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'svg') contentType = 'image/svg+xml';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${fileName}"`, 
      },
    });
  } catch (error) {
    console.error("Error en Route Handler:", error);
    return new NextResponse('Error interno del servidor de medios', { status: 500 });
  }
}