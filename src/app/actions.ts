'use server'

import { revalidatePath } from 'next/cache';

export async function purgarCachePerfil(slug: string) {
  // Esto borra la "foto" vieja de la página del cliente
  revalidatePath(`/${slug}`);
}