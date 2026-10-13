"use client";

import React from "react";
import { notFound, useParams } from "next/navigation";
import { businesses } from "../../data/businesses";
import MenuServicesTemplate from "../../components/templates/MenuServicesTemplate";
import BackToTop from "../../components/ui/BackToTop";

export default function BusinessPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const business = businesses[slug];

  if (!business) {
    notFound();
  }

  const renderTemplate = () => {
    switch (business.templateType) {
      case "menu-servicios":
        return <MenuServicesTemplate business={business} />;
      case "contacto-perfil":
        return <MenuServicesTemplate business={business} />;
      case "tienda-pedidos":
        return <MenuServicesTemplate business={business} />;
      case "agenda-citas":
        return <MenuServicesTemplate business={business} />;
      default:
        return <MenuServicesTemplate business={business} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Plantilla activa */}
      <div className="flex-1">
        {renderTemplate()}
      </div>

      {/* FOOTER GLOBAL LINKNI */}
      <footer className="w-full pt-0 pb-10 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-s font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>Impulsado por</span>
          <span className="font-bold text-gray-500">Linkni</span>
        </a>
      </footer>

      {/* BOTÓN BACK TO TOP GLOBAL */}
      <BackToTop color={business.theme.primary} />
    </div>
  );
}