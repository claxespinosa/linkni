export type LinkniTemplateType =
  | "contacto-perfil" // Tarjeta de contacto / Enlaces estilo bio
  | "menu-servicios" // Catálogo informativo, ingredientes, beneficios y cards de negocio
  | "tienda-pedidos" // Carrito ligero / selección de productos sin pasarela (cierre vía WhatsApp)
  | "agenda-citas"; // Servicios con estimación y solicitud de cita

export interface Product {
  id: string;
  category: string;
  name: string;
  tag?: string;
  description: string;
  keyAssets: string[];
  benefits: string;
  imgUrl?: string;
  price?: string;
}

export interface InfoSection {
  id: string;
  badge?: string;
  title: string;
  description: string;
  bullets: { bold?: string; text: string }[];
  ctaText: string;
  whatsappMessage: string;
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
  theme: {
    primary: string; // Color principal (Botones, Tabs activos)
    secondary: string; // Color secundario (Acentos, subtítulos, viñetas)
    bgLight: string; // Fondo suave para placeholders y cajas de beneficios
  };
  categories: string[];
  products: Product[];
  infoSections?: InfoSection[];
}

export const businesses: Record<string, BusinessProfile> = {
  "the-sund-blend": {
    slug: "the-sund-blend",
    templateType: "menu-servicios",
    name: "The Sund Blend",
    tagline: "COFFEE BAR & FUNCTIONAL NUTRITION",
    bio: "Energía sostenida sin picos ni caídas. Bebidas de especialidad preparadas con adaptógenos de alta pureza y repostería baja en carbohidratos.",
    whatsapp: "528100000000",
    instagram: "thesundblend",
    logoUrl: "https://adesarrolloweb.com/img/logo-the-sund-blend.png",
    theme: {
      primary: "#432616",
      secondary: "#A47148",
      bgLight: "#F7F3F0",
    },
    categories: ["Café", "Proteína", "Detox", "Refreshers", "Kids"],
    products: [
      {
        id: "neuro-focus",
        category: "Café",
        name: "Neuro Focus Coffee",
        tag: "V-NEUROKAFE",
        description:
          "Café nootrópico premium infusionado con Reishi, Ginseng y probióticos activos. Eleva tu concentración sin causar acidez.",
        keyAssets: [
          "Café negro arábigo",
          "Ganoderma (Reishi)",
          "Ginseng",
          "Inulina",
          "Probióticos",
          "Ácido Fúlvico",
        ],
        benefits:
          "Disminuye el estrés oxidativo, promueve agilidad y claridad mental, eleva la concentración y protege la salud cognitiva y digestiva.",
        imgUrl:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "vital-love",
        category: "Café",
        name: "Vital Love Kafe",
        tag: "V-LOVKAFE",
        description:
          "Café gourmet estimulante potenciado con adaptógenos de Maca, Tongkat Ali y Shilajit.",
        keyAssets: [
          "Café arábigo",
          "Tongkat Ali",
          "Tribulus terrestris",
          "Ginseng",
          "Raíz de Maca",
          "Shilajit",
          "L-Arginina",
        ],
        benefits:
          "Impulsa el equilibrio hormonal en hombres y mujeres, revitaliza la energía vital, mejora el estado de ánimo e incrementa la circulación.",
        imgUrl:
          "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "thermo-latte",
        category: "Café",
        name: "Thermo Latte (Iced / Hot)",
        tag: "V-THERMOKAFE",
        description:
          "Café arábigo artesanal formulado para acelerar el metabolismo basal y convertir lípidos en combustible sostenido.",
        keyAssets: [
          "Café arábigo",
          "L-Carnitina",
          "Guaraná",
          "Garcinia Cambogia",
          "Té Verde",
          "Yerba Mate",
          "Picolinato de Cromo",
        ],
        benefits:
          "Acelera el metabolismo, transforma la grasa acumulada en energía limpia, apoya el control del apetito y regula el azúcar en sangre.",
      },
      {
        id: "keto-bhb",
        category: "Café",
        name: "Keto Coffee BHB",
        tag: "V-KETOKAFE BHB",
        description:
          "Café cetogénico enriquecido con sales bioidénticas de BHB. Combustible celular directo sin romper el ayuno.",
        keyAssets: ["Café negro arábigo", "Sales BHB (Calcio, Magnesio y Sodio)"],
        benefits:
          "Induce y sostiene la cetosis, aporta energía celular inmediata, optimiza el rendimiento cognitivo y calma los antojos.",
      },
      {
        id: "vital-pro",
        category: "Proteína",
        name: "Malteada Proteica VitalPro",
        tag: "VITALPRO",
        description:
          "Malteada premium de proteína aislada sabor vainilla adicionada con colágeno, superfoods y hongos funcionales.",
        keyAssets: [
          "Aislado WPI y Soya",
          "Colágeno hidrolizado",
          "Reishi, Cordyceps y Shiitake",
          "Enzimas digestivas",
          "Espirulina",
        ],
        benefits:
          "Favorece el tono muscular y la recuperación, incrementa la saciedad prolongada y apoya la digestión sin causar distensión.",
        imgUrl:
          "https://images.unsplash.com/photo-1553530666-ba11a7dd724c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "detox-verde",
        category: "Detox",
        name: "Desintoxica-TE Verde",
        tag: "V-TE DETOX",
        description:
          "Infusión herbal digestiva y 100% botánica elaborada con 7 hierbas orgánicas.",
        keyAssets: [
          "Hoja de Caqui",
          "Hoja de Malva",
          "Nopal",
          "Jengibre",
          "Cardo Bendito",
          "Manzanilla",
        ],
        benefits:
          "Desinflama el abdomen de forma natural, estimula una depuración suave de toxinas y mejora el tránsito intestinal.",
        imgUrl:
          "https://images.unsplash.com/photo-1576092762791-dd9e2220abd2?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "colageno-rojos",
        category: "Refreshers",
        name: "Colágeno Frutos Rojos",
        tag: "VITALAGE COLLAGEN",
        description:
          "Refresher regenerativo con doble fuente de colágeno (marino y bovino), ácido hialurónico y caldo de hueso.",
        keyAssets: [
          "Colágeno Bovino y Marino",
          "Ácido Hialurónico",
          "Caldo de Hueso",
          "Resveratrol",
          "NAD",
          "Astaxantina",
        ],
        benefits:
          "Promueve firmeza y luminosidad en la piel, fortalece cabello y uñas, y brinda soporte profundo a articulaciones y cartílagos.",
      },
      {
        id: "mango-boost",
        category: "Refreshers",
        name: "Mango Boost",
        tag: "V-NRGY TROPICAL",
        description:
          "Refresher tropical vigorizante con cafeína natural de grano verde, guaraná y nootrópicos activos.",
        keyAssets: [
          "Cafeína de grano verde",
          "Guaraná",
          "DMAE",
          "L-Carnitina",
          "L-Teanina",
          "Té Verde",
          "Pulpa de mango",
        ],
        benefits:
          "Estimula la energía física sin taquicardias, eleva el rendimiento cognitivo y promueve el enfoque mental sostenido.",
      },
      {
        id: "dfence-kids",
        category: "Kids",
        name: "Defensa Infantil Inmuno Boost",
        tag: "D-FENCE KIDS",
        description:
          "Bebida infantil refrescante de pepino y limón para el blindaje integral del sistema inmunitario.",
        keyAssets: [
          "Tetrahidrocurcumina 95%",
          "Citrato de Zinc",
          "Treonato de Magnesio",
          "Vitaminas C, D3 y B3",
        ],
        benefits:
          "Protección antioxidante celular, efecto antiinflamatorio y soporte al neurodesarrollo saludable sin azúcares dañinos.",
        imgUrl:
          "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "chocoshake-kids",
        category: "Kids",
        name: "ChocoShake Kids",
        tag: "GENIUS SHAKE",
        description:
          "Malteada infantil de cacao auténtico con proteína limpia aislada, fibra prebiótica y superfoods.",
        keyAssets: [
          "Aislado WPI",
          "Cacao natural",
          "Inulina",
          "Espinaca, Noni, Saúco y Pitaya",
          "Maitake y Shiitake",
        ],
        benefits:
          "Respalda el desarrollo cognitivo y neurológico, promueve defensas fuertes y apoya el crecimiento saludable.",
      },
    ],
    infoSections: [
      {
        id: "club-de-compra",
        badge: "Club de compra",
        title: "¿Te gustó cómo rindió tu mente hoy?",
        description:
          "Deja de pagar precio por taza y recibe el producto a la puerta de tu casa",
        bullets: [
          {
            text: "Acceso directo a la plataforma de compras de VitalHealth con tu membresía anual ($500 MXN + IVA).",
          },
          {
            bold: "30% a 50% de descuento directo",
            text: "frente al precio al público por porción.",
          },
          {
            bold: "Bono de Lealtad:",
            text: "Recibe hasta 35% de cashback en puntos de recompra para canjear por producto gratis en compras del 1 al 7 de cada mes.",
          },
          {
            text: "Envíos directos a todo México, Estados Unidos y Latinoamérica sin intermediarios.",
          },
        ],
        ctaText: "Unirme al Club de Compra",
        whatsappMessage:
          "Hola, estuve en The Sund Blend y me interesa activar mi membresía del Club de Compra para adquirir los suplementos con descuento.",
      },
      {
        id: "socios-comerciales",
        badge: "Ecosistema de Negocio",
        title: "Socios comerciales",
        description:
          "The Sund Blend es solo la vitrina. Adéntrate en el ecosistema de distribución inteligente que está transformando la economía del bienestar.",
        bullets: [
          {
            bold: "Sin inventarios muertos:",
            text: "Un modelo de franquicia digital con laboratorios certificados (COFEPRIS, FDA, GMP).",
          },
          {
            bold: "Apalancamiento de la Nueva Economía:",
            text: "Genera márgenes de hasta el 100% en venta directa y hasta el 900% a través del exclusivo Bono Influencer de VitalHealth.",
          },
          {
            bold: "Tecnología a tu favor:",
            text: "Oficina virtual respaldada por inteligencia artificial (sistema VIA), embudos automatizados y logística resuelta.",
          },
          {
            bold: "Estructura profesional:",
            text: "Mentoría directa, entrenamientos semanales de liderazgo y un plan de compensación unilevel y binario con apalancamiento residual.",
          },
        ],
        ctaText: "Quiero ser Socio Comercial",
        whatsappMessage:
          "Hola, vi el catálogo de The Sund Blend y me gustaría recibir información sobre el modelo de franquicia digital para Socios Comerciales.",
      },
    ],
  },
};