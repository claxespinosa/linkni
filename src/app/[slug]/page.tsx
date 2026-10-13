"use client";

import React, { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { BusinessProfile } from "../../data/businesses";
import { createClient } from "../../lib/supabase";
import MenuServicesTemplate from "../../components/templates/MenuServicesTemplate";
import BackToTop from "../../components/ui/BackToTop";

export default function BusinessPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const supabase = createClient();

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!slug) return;

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setBusinessId(data.id);
        setBusiness({
          slug: data.slug,
          templateType: data.template_type,
          name: data.name,
          tagline: data.tagline || "",
          bio: data.bio || "",
          whatsapp: data.whatsapp || "",
          instagram: data.instagram || "",
          facebook: data.facebook || "",
          logoUrl: data.logo_url || "",
          socialConfig: data.social_config || {}, //
          theme: data.theme,
          categories: data.categories || [],
          products: data.products || [],
          infoSections: data.info_sections || [],
        });

        // Registrar visita silenciosa en métricas de Supabase
        await supabase.from("analytics_events").insert({
          business_id: data.id,
          event_type: "page_view",
        });
      }

      setLoading(false);
    };

    fetchBusiness();
  }, [slug]);

  // Función universal para registrar clics en botones desde cualquier plantilla
  const trackEvent = async (
    eventType: "whatsapp_click" | "product_click",
    itemName?: string
  ) => {
    if (!businessId) return;
    await supabase.from("analytics_events").insert({
      business_id: businessId,
      event_type: eventType,
      item_name: itemName || null,
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f8f9fa]" />;
  }

  if (!business) {
    notFound();
  }

  const renderTemplate = () => {
    switch (business.templateType) {
      case "menu-servicios":
        return <MenuServicesTemplate business={business} onTrackEvent={trackEvent} />;
      case "contacto-perfil":
        return <MenuServicesTemplate business={business} onTrackEvent={trackEvent} />;
      case "tienda-pedidos":
        return <MenuServicesTemplate business={business} onTrackEvent={trackEvent} />;
      case "agenda-citas":
        return <MenuServicesTemplate business={business} onTrackEvent={trackEvent} />;
      default:
        return <MenuServicesTemplate business={business} onTrackEvent={trackEvent} />;
    }
  };

  return (
    <div
      style={
        {
          "--client-primary": business.theme.primary,
          "--client-secondary": business.theme.secondary || business.theme.primary,
          "--client-bg-light": business.theme.bgLight || "#F7F3F0",
        } as React.CSSProperties
      }
      className="relative min-h-screen flex flex-col bg-[#f8f9fa]"
    >
      {/* Plantilla con los colores de la marca del cliente */}
      <div className="flex-1">{renderTemplate()}</div>

      {/* Footer con el estilo propio de tu marca Linkni */}
      <footer className="lk-powered-footer">
        <a href="/" className="lk-powered-badge">
          <span>Impulsado por</span>
          <span className="lk-powered-brand">Linkni</span>
        </a>
      </footer>

      {/* Botón flotante con el color del cliente */}
      <BackToTop color={business.theme.primary} />
    </div>
  );
}