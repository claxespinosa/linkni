"use client";

import React, { useState, useEffect } from "react";
import { BusinessProfile, Product } from "../../data/businesses";

interface MenuServicesTemplateProps {
  business: BusinessProfile;
  onTrackEvent?: (type: "whatsapp_click" | "product_click", itemName?: string) => void;
}

export default function MenuServicesTemplate({
  business,
  onTrackEvent,
}: MenuServicesTemplateProps) {
  const { categories, products, infoSections } = business;

  // Categorías creadas por el cliente para dividir su menú
  const displayCategories = (categories || []).filter((c) => c !== "Todos");
  const hasCategories = displayCategories.length > 0;

  const [activeCategory, setActiveCategory] = useState(displayCategories[0] || "");

  useEffect(() => {
    if (displayCategories.length > 0 && !displayCategories.includes(activeCategory)) {
      setActiveCategory(displayCategories[0]);
    }
  }, [displayCategories, activeCategory]);

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
    if (!hasCategories) return;

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
  }, [displayCategories, hasCategories]);

  // Productos que no coinciden con ninguna categoría activa (para que nunca se oculten por error)
  const uncategorizedProducts = hasCategories
    ? products.filter((p) => !p.category || !displayCategories.includes(p.category))
    : [];

  // Configuración de botones y redes con valores de respaldo por si es un registro antiguo
  const sc = {
    showWhatsapp: true,
    whatsappMessage: `Hola, me gustaría más información sobre ${business.name}.`,
    showInstagram: Boolean(business.instagram),
    showFacebook: Boolean(business.facebook),
    showTiktok: false,
    tiktok: "",
    showCustomLink: false,
    customLinkLabel: "",
    customLinkUrl: "",
    showGoogleReviews: false,
    googleReviewsUrl: "",
    googleRating: "5.0",
    ...(business.socialConfig || {}),
  };

  const whatsappHeaderMsg =
    sc.whatsappMessage?.trim() || `Hola, me gustaría más información sobre ${business.name}.`;

  // Tarjeta individual de Producto / Servicio (Sin precio en Menú Informativo)
  const renderProductCard = (item: Product) => {
    // Lógica para determinar el enlace y el ícono del botón
    let buttonUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
      `Hola, me interesa saber más sobre ${item.name}`
    )}`;
    let isWhatsApp = true;

    if (item.customLink && item.customLink.trim() !== "") {
      const rawUrl = item.customLink.trim();
      isWhatsApp = rawUrl.includes("wa.me") || rawUrl.includes("whatsapp.com");
      
      // Si no es un enlace de WhatsApp, agregamos los parámetros UTM de Linkni
      if (!isWhatsApp && rawUrl.startsWith("http")) {
        try {
          const parsedUrl = new URL(rawUrl);
          if (!parsedUrl.searchParams.has("utm_source")) parsedUrl.searchParams.set("utm_source", "linkni");
          if (!parsedUrl.searchParams.has("utm_medium")) parsedUrl.searchParams.set("utm_medium", "menu-servicios");
          if (!parsedUrl.searchParams.has("utm_campaign")) parsedUrl.searchParams.set("utm_campaign", item.name.replace(/\s+/g, '-').toLowerCase());
          buttonUrl = parsedUrl.toString();
        } catch (e) {
          buttonUrl = rawUrl; // Fallback si la URL escrita no es válida
        }
      } else {
        buttonUrl = rawUrl;
      }
    }

    return (
      <article key={item.id} className="tpl-card">
        <div className="tpl-card-img-box">
          {item.imgUrl ? (
            <img
              src={item.imgUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-12 h-12 opacity-35 tpl-accent-text"
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
            <div className="c-tag absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-xs">
              <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">
                {item.tag}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="c-title font-bold text-gray-900 mb-2">{item.name}</h3>

          <p className="c-description text-sm mb-5 leading-relaxed">
            {item.description}
          </p>

          {item.keyAssets && item.keyAssets.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-bold mb-1.5 tpl-accent-text mb-2">
                Ingredientes / Características
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

          {item.benefits && (
            <div className="mb-6 flex-1">
              <h4 className="text-xs font-bold mb-1.5 tpl-accent-text">
                Beneficios
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{item.benefits}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-50 mt-auto">
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrackEvent?.("product_click", item.name)}
              className="btn-contact tpl-btn-soft"
            >
              {isWhatsApp ? (
                <svg className="w-4 h-4 tpl-icon-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 tpl-icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
              Me interesa
            </a>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="tpl-page">
      {/* HEADER DEL CLIENTE */}
      <header className="tpl-header">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={`Logo de ${business.name}`}
            className="tpl-logo"
          />
        ) : (
          <div className="tpl-avatar">
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
        <p className="tpl-tagline">{business.tagline}</p>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6 px-4">
          {business.bio}
        </p>

        {/* Botones de Acción controlados por Checkboxes */}
        <div className="flex flex-col gap-2.5 w-full max-w-sm px-2">
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {sc.showWhatsapp !== false && business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                  whatsappHeaderMsg
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackEvent?.("whatsapp_click", "WhatsApp Principal")}
                className="tpl-btn-primary flex-1 min-w-[140px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}

            {sc.showInstagram && business.instagram && (
              <a
                href={`https://instagram.com/${business.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tpl-btn-outline"
              >
                Instagram
              </a>
            )}

            {sc.showFacebook && business.facebook && (
              <a
                href={`https://facebook.com/${business.facebook.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tpl-btn-outline"
              >
                Facebook
              </a>
            )}

            {sc.showTiktok && sc.tiktok && (
              <a
                href={`https://tiktok.com/@${sc.tiktok.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tpl-btn-outline"
              >
                TikTok
              </a>
            )}
          </div>

          {/* Botón de Enlace Personalizado (Nombre + URL) */}
          {sc.showCustomLink && sc.customLinkLabel && sc.customLinkUrl && (
            <a
              href={sc.customLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tpl-btn-outline w-full py-2.5 text-xs font-semibold"
            >
              🔗 {sc.customLinkLabel}
            </a>
          )}

          {/* Botón de Reseñas de Google */}
          {sc.showGoogleReviews && sc.googleReviewsUrl && (
            <a
              href={sc.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tpl-btn-outline w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span className="text-amber-500">★★★★★</span>
              <span>{sc.googleRating || "5.0"} en Google · Ver reseñas</span>
            </a>
          )}

          {infoSections && infoSections.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToSection("secciones-informativas")}
              className="tpl-btn-soft py-2.5 text-xs"
            >
              Club & Socios
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-2">
        {/* TABS STICKY: Se muestran si el cliente creó divisiones/categorías */}
        {hasCategories && (
          <div className="tpl-tabs-sticky">
            <div className="tpl-tabs-bar no-scrollbar">
              {displayCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => scrollToSection(cat)}
                  className={`tpl-tab ${activeCategory === cat ? "tpl-tab-active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CATÁLOGO DE PRODUCTOS / SERVICIOS */}
        <div className="flex flex-col gap-10 mt-4 mb-12">
          {hasCategories ? (
            <>
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
                      {categoryProducts.map((item) => renderProductCard(item))}
                    </div>
                  </section>
                );
              })}

              {/* Si algún producto quedó sin categoría asignada, se muestra al final */}
              {uncategorizedProducts.length > 0 && (
                <section className="flex flex-col gap-5">
                  <div className="flex items-center gap-3 px-1">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Otros</h2>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>
                  <div className="flex flex-col gap-6">
                    {uncategorizedProducts.map((item) => renderProductCard(item))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-6">
              {products.map((item) => renderProductCard(item))}
            </div>
          )}
        </div>

        {/* SECCIONES INFORMATIVAS ADICIONALES */}
        {infoSections && infoSections.length > 0 && (
          <div id="section-secciones-informativas" className="flex flex-col gap-6 pt-4">
            {infoSections.map((section) => {
              // Lógica de URL dinámica para la tarjeta
              let buttonUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                section.whatsappMessage
              )}`;
              let isWhatsApp = true;

              if (section.customLink && section.customLink.trim() !== "") {
                const rawUrl = section.customLink.trim();
                isWhatsApp = rawUrl.includes("wa.me") || rawUrl.includes("whatsapp.com");

                if (!isWhatsApp && rawUrl.startsWith("http")) {
                  try {
                    const parsedUrl = new URL(rawUrl);
                    if (!parsedUrl.searchParams.has("utm_source")) parsedUrl.searchParams.set("utm_source", "linkni");
                    if (!parsedUrl.searchParams.has("utm_medium")) parsedUrl.searchParams.set("utm_medium", "menu-servicios");
                    if (!parsedUrl.searchParams.has("utm_campaign")) parsedUrl.searchParams.set("utm_campaign", section.title.replace(/\s+/g, '-').toLowerCase());
                    buttonUrl = parsedUrl.toString();
                  } catch (e) {
                    buttonUrl = rawUrl;
                  }
                } else {
                  buttonUrl = rawUrl;
                }
              }

              return (
                <section key={section.id} className="tpl-card-info">
                  {section.badge && (
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 tpl-accent-text">
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
                    href={buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onTrackEvent?.("whatsapp_click", section.title)}
                    className="tpl-btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {!isWhatsApp && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                    {section.ctaText}
                  </a>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}