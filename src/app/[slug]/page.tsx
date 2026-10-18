import { Metadata } from "next";
import { createClient } from "../../lib/supabase";
import ClientPage from "./ClientPage"; // Importamos tu archivo renombrado

type Props = {
  params: { slug: string };
};

// 1. Esta función es la que lee WhatsApp para armar la miniatura con el logo
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();

  const { data } = await supabase
    .from("businesses")
    .select("name, tagline, bio, logo_url")
    .eq("slug", params.slug)
    .maybeSingle();

  const title = data?.name || "Linkni";
  const description = data?.tagline || data?.bio || "Visita nuestro perfil";

  // WhatsApp exige que la URL del logo sea absoluta (que empiece con https://)
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
      images: imageUrl ? [imageUrl] : [], // Aquí le entregamos el logo a WhatsApp
    },
  };
}

// 2. Renderizamos tu componente original intacto
export default function Page() {
  return <ClientPage />;
}