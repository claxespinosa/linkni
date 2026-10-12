import { notFound } from "next/navigation";
import { businesses } from "@/data/businesses";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const business = businesses[slug];
  if (!business) return { title: "Negocio no encontrado | Linkni" };

  return {
    title: `${business.name} | Linkni`,
    description: business.tagline,
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const business = businesses[slug];

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Cabecera */}
        <header className="flex flex-col items-center text-center gap-3 pt-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-3xl font-bold text-neutral-950 shadow-lg shadow-amber-900/20">
            {business.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
            <p className="text-xs font-semibold tracking-wider uppercase text-amber-400 mt-1">
              {business.category}
            </p>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {business.bio}
          </p>
        </header>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <a
            href={`https://wa.me/${business.whatsapp}?text=Hola,%20quiero%20hacer%20un%20pedido%20en%20The%20Sund%20Blend`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl text-center text-sm transition shadow-md shadow-emerald-950/50"
          >
            Pedir por WhatsApp
          </a>
          {business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium py-3 rounded-xl text-sm transition"
            >
              Instagram
            </a>
          )}
        </div>

        {/* Menú / Catálogo */}
        {business.menuSections && (
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Menú Destacado
            </h2>
            {business.menuSections.map((sec) => (
              <div key={sec.category} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-amber-500 uppercase">
                  {sec.category}
                </h3>
                <div className="flex flex-col gap-2">
                  {sec.items.map((item) => (
                    <div
                      key={item.name}
                      className="bg-neutral-900 border border-neutral-800/80 p-3 rounded-xl flex justify-between items-start gap-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-neutral-200">{item.name}</span>
                        <span className="text-xs text-neutral-400 leading-snug">{item.description}</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-400 shrink-0">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Sello de marca Linkni */}
        <footer className="pt-6 pb-4 text-center">
          <a
            href="/"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition"
          >
            Impulsado por <span className="font-semibold text-neutral-400">Linkni</span>
          </a>
        </footer>
      </div>
    </main>
  );
}