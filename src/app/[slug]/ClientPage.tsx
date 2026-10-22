"use client";

import React, { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { BusinessProfile } from "../../data/businesses";
import { createClient } from "../../lib/supabase";
import MenuServicesTemplate from "../../components/templates/MenuServicesTemplate";
import Image from "next/image";
import BackToTop from "../../components/ui/BackToTop";

export default function BusinessPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const supabase = createClient();

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si los params aún no han hidratado en el cliente, esperar
    if (!slug) return;

    let isMounted = true;

    const fetchBusiness = async () => {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) {
          console.error("Error al consultar negocio en Supabase:", error);
        }

        if (data && isMounted) {
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
            socialConfig: data.social_config || {},
            theme: data.theme || { primary: "#111827", secondary: "#4B5563", bgLight: "#F7F3F0" },
            categories: data.categories || [],
            products: data.products || [],
            infoSections: data.info_sections || [],
            customClubLabel: (data as any).custom_labels?.club_module || 'Club & Socios',
          });

          // Registrar visita silenciosa
          await supabase.from("analytics_events").insert({
            business_id: data.id,
            event_type: "page_view",
          });
        }
      } catch (err) {
        console.error("Fallo inesperado al conectar con Supabase:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBusiness();

    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  // Spinner neutro mientras resuelve la consulta en el cliente
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-7 h-7 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Si terminó de cargar y no existe ese slug en la base de datos, dispara el 404
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
      <div className="flex-1">{renderTemplate()}</div>

    <footer className="lk-powered-footer mt-auto">
        <a href="/" className="lk-powered-badge flex items-center justify-center gap-1.5">
          <span>Impulsado por</span>
          <Image 
            //src="https://mlwyhzquiamzgiywtycn.supabase.co/storage/v1/object/public/business-assets/img/linkni-logo.png"
            src="/api/media/img/linkni-logo.png"
            alt="Logo Linkni"
            width={40}
            height={16} /* Ajusta el alto según la proporción real de tu logo */
            className="lk-powered-brand object-contain"
          />
          <span>© {new Date().getFullYear()}</span>
        </a>
      </footer>

      <BackToTop color={business.theme.primary} />
    </div>
  );
}