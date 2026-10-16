import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ 
  params 
}: { 
  // Soportamos Next.js 14 y 15 resolviendo la promesa
  params: { slug: string } | Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Instanciamos el cliente puro para que funcione correctamente en el Servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) {
    return { title: "Cargando... | Linkni" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 2. Consultamos solo lo necesario
  const { data, error } = await supabase
    .from("businesses")
    .select("name, tagline")
    .eq("slug", slug)
    .maybeSingle();

  // 3. Si no hay datos, mostramos el fallback
  if (error || !data) {
    return {
      title: "Página no encontrada | Linkni",
    };
  }

  // 4. Si hay éxito, inyectamos los nombres dinámicos
  return {
    title: `${data.name} | Linkni`,
    description: data.tagline || `Sitio oficial de ${data.name} impulsado por Linkni`,
    openGraph: {
      title: data.name,
      description: data.tagline || "Visita nuestro menú interactivo.",
      siteName: data.name,
    },
  };
}

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}