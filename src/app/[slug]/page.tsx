export const revalidate = 0;
import { Metadata } from "next";
import { createClient } from "../../lib/supabase";
import ClientPage from "./ClientPage";

// Ajuste para soportar params asíncronos en las versiones nuevas de Next.js
type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 1. Extraemos el slug correctamente esperando la promesa
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const supabase = createClient();

  // 2. Buscamos el negocio en Supabase
  const { data } = await supabase
    .from("businesses")
    .select("name, tagline, bio, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  // 3. Asignamos la información (ahora sí encontrará a The Sund Blend)
  const title = data?.name || "Linkni";
  const description = data?.tagline || data?.bio || "Visita nuestro perfil";

  // 4. Preparamos el logo con URL absoluta para WhatsApp
  let imageUrl = data?.logo_url || "";
  if (imageUrl.startsWith("/")) {
    imageUrl = `https://linkni.adesarrolloweb.com${imageUrl}`;
  }

  return {
    title: `${title} | Linkni`,
    description,
    openGraph: {
      title,
      description,
      url: `https://linkni.adesarrolloweb.com/${slug}`,
      siteName: "Linkni",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 600, // WhatsApp pide ancho y alto explícito para cargar la previa más rápido
              height: 600,
              alt: title,
            },
          ]
        : [],
    },
  };
}

export default function Page() {
  return <ClientPage />;
}