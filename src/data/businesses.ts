export type LinkniTemplateType =
  | "contacto-perfil"
  | "menu-servicios"
  | "tienda-pedidos"
  | "agenda-citas";

export interface Product {
  id: string;
  category?: string;
  name: string;
  tag?: string;
  description: string;
  keyAssets: string[];
  benefits: string;
  imgUrl?: string;
  price?: string;
  options?: string;
  customLink?: string;
}

export interface InfoSection {
  id: string;
  badge?: string;
  title: string;
  description: string;
  bullets: { bold?: string; text: string }[];
  ctaText: string;
  whatsappMessage: string;
  customLink?: string;
}

export interface SocialConfig {
  showWhatsapp?: boolean;
  whatsappMessage?: string;
  showInstagram?: boolean;
  showFacebook?: boolean;
  showTiktok?: boolean;
  tiktok?: string;
  showCustomLink?: boolean;
  customLinkLabel?: string;
  customLinkUrl?: string;
  showGoogleReviews?: boolean;
  googleReviewsUrl?: string;
  googleRating?: string;
}

export interface StoreConfig {
  isOpen?: boolean;
  closedMessage?: string;
  shippingCost?: number;
  minOrder?: number;
}

export interface BusinessProfile {
  slug: string;
  templateType: LinkniTemplateType;
  name: string;
  tagline: string;
  bio: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  logoUrl?: string;
  socialConfig?: SocialConfig;
  storeConfig?: StoreConfig; // NUEVO
  theme: {
    primary: string;
    secondary: string;
    bgLight: string;
  };
  categories: string[];
  products: Product[];
  infoSections?: InfoSection[];
}

export const DEFAULT_BUSINESS: BusinessProfile = {
  slug: "",
  templateType: "menu-servicios",
  name: "Cargando...",
  tagline: "",
  bio: "",
  whatsapp: "",
  theme: {
    primary: "#111827",
    secondary: "#4B5563",
    bgLight: "#F7F3F0",
  },
  socialConfig: {
    showWhatsapp: true,
    whatsappMessage: "Hola, me gustaría más información.",
  },
  categories: [],
  products: [],
  infoSections: [],
};