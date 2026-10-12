export interface BusinessProfile {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  bio: string;
  whatsapp: string;
  instagram?: string;
  menuSections?: {
    category: string;
    items: { name: string; price: string; description: string }[];
  }[];
}

export const businesses: Record<string, BusinessProfile> = {
  "the-sund-blend": {
    slug: "the-sund-blend",
    name: "The Sund Blend",
    tagline: "Café funcional, adaptógenos y nutrición cetogénica",
    category: "Coffee Bar & Functional Nutrition",
    bio: "Energía sostenida sin picos ni caídas. Bebidas de especialidad preparadas con adaptógenos de alta pureza y repostería baja en carbohidratos.",
    whatsapp: "528100000000", // Reemplaza con el número real de WhatsApp
    instagram: "thesundblend",
    menuSections: [
      {
        category: "Bebidas Funcionales",
        items: [
          { name: "Bulletproof Sund", price: "$95", description: "Espresso, aceite MCT y mantequilla clarificada" },
          { name: "Matcha Adaptógeno", price: "$110", description: "Matcha ceremonial con melena de león y cordyceps" },
          { name: "Golden Latte", price: "$90", description: "Cúrcuma, jengibre, canela y leche de almendra" }
        ]
      },
      {
        category: "Keto Bakery",
        items: [
          { name: "Muffin de Almendra", price: "$65", description: "Harina de almendra, monk fruit y cacao 85%" },
          { name: "Cheesecake Keto", price: "$85", description: "Base de nuez pecana y queso crema artesanal" }
        ]
      }
    ]
  }
};