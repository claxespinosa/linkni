"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { businesses } from "../../data/businesses";
import React from "react";

export default function BusinessProfile({ params }: { params: { slug: string } }) {
  const { slug } = React.use(params as any); 
  const business = businesses[slug];

  if (!business) {
    notFound();
  }

  const [activeCategory, setActiveCategory] = useState("Todos");
  const categories = ["Todos", "Café", "Proteína", "Detox", "Kids"];

  const filteredProducts = activeCategory === "Todos" 
    ? business.products 
    : business.products.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-16 text-slate-800">
      
      {/* HEADER HOMOGÉNEO Y LIMPIO */}
      <header className="bg-white px-5 pt-12 pb-8 flex flex-col items-center text-center shadow-sm border-b border-gray-100">
        {business.logoUrl ? (
          <img 
            src={business.logoUrl} 
            alt={`Logo de ${business.name}`} 
            className="h-28 object-contain mb-4"
          />
        ) : (
          <div 
            style={{ backgroundColor: business.theme.primary }}
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-md"
          >
            {business.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">{business.name}</h1>
        <p style={{ color: business.theme.secondary }} className="text-[10px] font-bold tracking-widest uppercase mb-4">
          {business.tagline}
        </p>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6 px-4">
          {business.bio}
        </p>
        
        {/* Botones Generales de Contacto */}
        <div className="flex gap-3 w-full max-w-sm px-2">
          <a
            href={`https://wa.me/${business.whatsapp}?text=Hola,%20me%20gustaría%20más%20información.`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: business.theme.primary }}
            className="flex-1 text-white font-medium py-3 rounded-xl text-sm shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contacto
          </a>
          {/*{business.instagram && (
            <a
              //href={`https://instagram.com/${business.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              Instagram
            </a>
          )} */}
          <a
            href="#club-de-compra"
            className="px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold py-3 rounded-xl text-sm transition-colors text-center shrink-0"
            >
            Club & Socios
           </a>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-6">
        {/* PESTAÑAS (TABS) DINÁMICAS */}
        <div className="sticky top-4 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 flex overflow-x-auto gap-1 no-scrollbar mb-6 z-30">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={activeCategory === cat ? { backgroundColor: business.theme.primary, color: 'white' } : {}}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FEED DE PRODUCTOS HOMOGÉNEO (Diseño exacto de la 2da imagen) */}
        <div className="flex flex-col gap-6 mb-12">
          {filteredProducts.map((product) => (
            <article key={product.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              
              {/* ÁREA DE IMAGEN ESTANDARIZADA */}
              <div 
                className="relative h-48 w-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={!product.imgUrl ? { backgroundColor: business.theme.bgLight } : {}}
              >
                {product.imgUrl ? (
                  <img src={product.imgUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <svg style={{ color: business.theme.secondary }} className="w-12 h-12 opacity-35" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h8" /></svg>
                )}
                
                {product.tag && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm">
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">{product.tag}</span>
                  </div>
                )}
              </div>

              {/* CONTENIDO DE LA TARJETA */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{product.description}</p>
                
                {/* Bloque Ingredientes Clave */}
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredientes Clave</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.keyAssets.map((asset, idx) => (
                      <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bloque Beneficios */}
                <div className="mb-6 flex-1">
                  <h4 style={{ color: business.theme.secondary }} className="text-xs font-bold mb-1.5">Beneficios</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{product.benefits}</p>
                </div>

                {/* BOTÓN DE MICRO-CONVERSIÓN CONTEXTUAL */}
                <div className="pt-4 border-t border-gray-50 mt-auto">
                  <a 
                    href={`https://wa.me/${business.whatsapp}?text=Hola,%20me%20interesa%20saber%20más%20sobre%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl text-sm transition-colors border border-gray-200"
                  >
                    <svg style={{ color: business.theme.primary }} className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                    Me interesa
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* SECCIÓN 1: CLUB DE COMPRA */}
        <div id="club-de-compra" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
          <p style={{ color: business.theme.secondary }} className="text-xs font-bold uppercase tracking-wider mb-1">Club de compra</p>
          <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">¿Te gustó cómo rindió tu mente hoy?</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">Deja de pagar precio por taza y recibe el producto a la puerta de tu casa.</p>
          <ul className="text-sm text-gray-600 space-y-2.5 mb-6 pl-4 list-disc">
            <li>Acceso directo a la plataforma de compras de VitalHealth con tu membresía anual ($500 MXN + IVA).</li>
            <li>Hasta un <strong>30% a 50% de descuento directo</strong> frente al precio al público por porción.</li>
            <li><strong>Bono de Lealtad:</strong> Recibe hasta 35% de cashback en puntos de recompra para canjear por producto gratis del 1 al 7 de cada mes.</li>
            <li>Envíos directos a todo México, Estados Unidos y Latinoamérica sin intermediarios.</li>
          </ul>
          <a 
            href={`https://wa.me/${business.whatsapp}?text=Me%20interesa%20el%20Club%20de%20Compras`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ backgroundColor: business.theme.primary }}
            className="block w-full text-white text-center font-bold py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90"
          >
            Unirme al Club
          </a>
        </div>

        {/* SECCIÓN 2: SOCIOS COMERCIALES */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <p style={{ color: business.theme.secondary }} className="text-xs font-bold uppercase tracking-wider mb-1">Ecosistema de distribución</p>
          <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Socios comerciales</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">The Sund Blend es solo la vitrina. Adéntrate en el ecosistema de distribución inteligente que está transformando la economía del bienestar.</p>
          <ul className="text-sm text-gray-600 space-y-2.5 mb-6 pl-4 list-disc">
            <li><strong>Sin inventarios muertos:</strong> Un modelo de franquicia digital con laboratorios certificados (COFEPRIS, FDA, GMP).</li>
            <li><strong>Apalancamiento de la Nueva Economía:</strong> Genera márgenes de hasta el 100% en venta directa y hasta el 900% a través del exclusivo Bono Influencer de VitalHealth.</li>
            <li><strong>Tecnología a tu favor:</strong> Oficina virtual respaldada por inteligencia artificial (sistema VIA), embudos automatizados y logística resuelta.</li>
            <li><strong>Estructura profesional:</strong> Mentoría directa, entrenamientos semanales de liderazgo y un plan de compensación unilevel y binario con apalancamiento residual.</li>
          </ul>
          <a 
            href={`https://wa.me/${business.whatsapp}?text=Me%20interesa%20información%20sobre%20Socios%20Comerciales`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ backgroundColor: business.theme.primary }}
            className="block w-full text-white text-center font-bold py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90"
          >
            Más Información
          </a>
        </div>
      </div>
    </main>
  );
}