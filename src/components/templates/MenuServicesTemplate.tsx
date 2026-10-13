"use client";

import React, { useState, useEffect } from "react";
import { BusinessProfile } from "../../data/businesses";

interface MenuServicesTemplateProps {
  business: BusinessProfile;
}

export default function MenuServicesTemplate({ business }: MenuServicesTemplateProps) {
  const { categories, products, theme, infoSections } = business;

  // Filtramos "Todos" si viniera en la lista para organizar por bloques limpios
  const displayCategories = categories.filter((c) => c !== "Todos");
  const [activeCategory, setActiveCategory] = useState(displayCategories[0] || "");

  const scrollToSection = (catName: string) => {
    setActiveCategory(catName);
    const element = document.getElementById(`section-${catName}`);
    if (element) {
      const headerOffset = 92;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (const cat of displayCategories) {
        const el = document.getElementById(`section-${cat}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategory(cat);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCategories]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-16 text-slate-800">
      {/* HEADER HOMOGÉNEO */}
      <header className="bg-white px-5 pt-12 pb-8 flex flex-col items-center text-center shadow-sm border-b border-gray-100">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={`Logo de ${business.name}`}
            className="w-32 h-32 object-contain mb-4 border border-[#ececec] rounded-full p-2 bg-white"
          />
        ) : (
          <div
            style={{ backgroundColor: theme.primary }}
            className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-black text-white mb-4 border border-[#ececec] shadow-sm select-none"
          >
            {business.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}

        <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">
          {business.name}
        </h1>
        <p
          style={{ color: theme.secondary || theme.primary }}
          className="text-[10px] font-bold tracking-widest uppercase mb-4"
        >
          {business.tagline}
        </p>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6 px-4">
          {business.bio}
        </p>

        {/* Acciones principales: WhatsApp + Redes + Botón a Cards */}
        <div className="flex flex-col gap-3 w-full max-w-sm px-2">
          <div className="flex gap-2 w-full">
            <a
              href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                `Hola, me gustaría más información sobre ${business.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: theme.primary }}
              className="flex-1 text-white font-medium py-3 rounded-xl text-sm shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            {business.instagram && (
              <a
                href={`https://instagram.com/${business.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center"
              >
                Instagram
              </a>
            )}

            {business.facebook && (
              <a
                href={`https://facebook.com/${business.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center"
              >
                Facebook
              </a>
            )}
          </div>

          {infoSections && infoSections.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToSection("secciones-informativas")}
              className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Club & Socios
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-2">
        {/* NAVEGACIÓN STICKY POR CATEGORÍAS */}
        <div className="sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200/80 flex overflow-x-auto gap-1.5 no-scrollbar">
            {displayCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => scrollToSection(cat)}
                style={
                  activeCategory === cat
                    ? { backgroundColor: theme.primary, color: "white" }
                    : {}
                }
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-colors focus:outline-none cursor-pointer ${
                  activeCategory === cat
                    ? "shadow-sm"
                    : "bg-transparent text-gray-500 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEED ORGANIZADO POR CATEGORÍAS */}
        <div className="flex flex-col gap-10 mt-2 mb-12">
          {displayCategories.map((catName) => {
            const categoryProducts = products.filter((p) => p.category === catName);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={catName} id={`section-${catName}`} className="flex flex-col gap-5">
                <div className="flex items-center gap-3 px-1">
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">{catName}</h2>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                <div className="flex flex-col gap-6">
                  {categoryProducts.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                    >
                      {/* Imagen o Placeholder */}
                      <div
                        className="relative h-48 w-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={!item.imgUrl ? { backgroundColor: theme.bgLight } : {}}
                      >
                        {item.imgUrl ? (
                          <img
                            src={item.imgUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            style={{ color: theme.secondary || theme.primary }}
                            className="w-12 h-12 opacity-35"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h8"
                            />
                          </svg>
                        )}

                        {item.tag && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm">
                            <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">
                              {item.tag}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Activos Clave */}
                        {item.keyAssets && item.keyAssets.length > 0 && (
                          <div className="mb-5">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Ingredientes Clave
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {item.keyAssets.map((asset, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium"
                                >
                                  {asset}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Beneficios */}
                        {item.benefits && (
                          <div className="mb-6 flex-1">
                            <h4
                              style={{ color: theme.secondary || theme.primary }}
                              className="text-xs font-bold mb-1.5"
                            >
                              Beneficios
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.benefits}</p>
                          </div>
                        )}

                        {/* Micro-conversión */}
                        <div className="pt-4 border-t border-gray-50 mt-auto">
                          <a
                            href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                              `Hola, me interesa saber más sobre ${item.name}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl text-sm transition-colors border border-gray-200"
                          >
                            <svg
                              style={{ color: theme.primary }}
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Me interesa
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* SECCIONES INFORMATIVAS (Club & Socios) */}
        {infoSections && infoSections.length > 0 && (
          <div id="section-secciones-informativas" className="flex flex-col gap-6 pt-4">
            {infoSections.map((section) => (
              <section
                key={section.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
              >
                {section.badge && (
                  <p
                    style={{ color: theme.secondary || theme.primary }}
                    className="text-xs font-bold uppercase tracking-wider mb-1"
                  >
                    {section.badge}
                  </p>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  {section.description}
                </p>

                <ul className="text-sm text-gray-600 space-y-3 mb-7 pl-4 list-disc">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet.bold && (
                        <strong className="font-bold text-gray-900">{bullet.bold} </strong>
                      )}
                      {bullet.text}
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                    section.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: theme.primary }}
                  className="block w-full text-white text-center font-bold py-3.5 rounded-xl text-sm shadow-sm hover:opacity-90 transition-opacity"
                >
                  {section.ctaText}
                </a>
              </section>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}