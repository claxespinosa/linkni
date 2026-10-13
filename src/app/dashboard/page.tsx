"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import {
  BusinessProfile,
  Product,
  InfoSection,
  SocialConfig,
  DEFAULT_BUSINESS,
} from "../../data/businesses";

const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  showWhatsapp: true,
  whatsappMessage: "Hola, me gustaría más información.",
  showInstagram: true,
  showFacebook: false,
  showTiktok: false,
  tiktok: "",
  showCustomLink: false,
  customLinkLabel: "",
  customLinkUrl: "",
  showGoogleReviews: false,
  googleReviewsUrl: "",
  googleRating: "5.0",
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const MASTER_EMAIL = process.env.NEXT_PUBLIC_MASTER_EMAIL || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"metricas" | "editor" | "perfil">("editor");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isMaster, setIsMaster] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Estados para cambiar contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [newCategory, setNewCategory] = useState("");

  const [stats, setStats] = useState({
    views: 0,
    whatsappClicks: 0,
    topProducts: [] as { name: string; count: number }[],
  });

  const social = { ...DEFAULT_SOCIAL_CONFIG, ...(business.socialConfig || {}) };

  const updateSocial = (patch: Partial<SocialConfig>) => {
    setBusiness({
      ...business,
      socialConfig: { ...social, ...patch },
    });
  };

  const selectBusinessRow = async (bizData: any) => {
    setBusinessId(bizData.id);
    setBusiness({
      slug: bizData.slug,
      templateType: bizData.template_type,
      name: bizData.name,
      tagline: bizData.tagline || "",
      bio: bizData.bio || "",
      whatsapp: bizData.whatsapp || "",
      instagram: bizData.instagram || "",
      facebook: bizData.facebook || "",
      logoUrl: bizData.logo_url || "",
      socialConfig: {
        ...DEFAULT_SOCIAL_CONFIG,
        showInstagram: Boolean(bizData.instagram),
        showFacebook: Boolean(bizData.facebook),
        ...(bizData.social_config || {}),
      },
      theme: bizData.theme || { primary: "#111827", secondary: "#4B5563", bgLight: "#F7F3F0" },
      categories: bizData.categories || [],
      products: bizData.products || [],
      infoSections: bizData.info_sections || [],
    });

    const { data: events } = await supabase
      .from("analytics_events")
      .select("event_type, item_name")
      .eq("business_id", bizData.id);

    if (events) {
      const views = events.filter((e) => e.event_type === "page_view").length;
      const waClicks = events.filter(
        (e) => e.event_type === "whatsapp_click" || e.event_type === "product_click"
      ).length;

      const prodCounts: Record<string, number> = {};
      events
        .filter((e) => e.event_type === "product_click" && e.item_name)
        .forEach((e) => {
          prodCounts[e.item_name] = (prodCounts[e.item_name] || 0) + 1;
        });

      const topProducts = Object.entries(prodCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({ views, whatsappClicks: waClicks, topProducts });
    } else {
      setStats({ views: 0, whatsappClicks: 0, topProducts: [] });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("reset=true")) {
      setActiveTab("perfil");
    }

    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email);
      const userIsMaster =
        MASTER_EMAIL !== "" && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase();
      setIsMaster(userIsMaster);

      if (userIsMaster) {
        const { data: list } = await supabase
          .from("businesses")
          .select("*")
          .order("created_at", { ascending: false });

        if (list && list.length > 0) {
          setAllBusinesses(list);
          await selectBusinessRow(list[0]);
        }
      } else {
        const { data: bizData } = await supabase
          .from("businesses")
          .select("*")
          .eq("email", user.email)
          .single();

        if (bizData) {
          await selectBusinessRow(bizData);
        }
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    if (!businessId) {
      alert("No se encontró un negocio asignado a este correo en Supabase.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        name: business.name,
        tagline: business.tagline,
        bio: business.bio,
        whatsapp: business.whatsapp,
        instagram: business.instagram,
        facebook: business.facebook,
        logo_url: business.logoUrl,
        social_config: business.socialConfig,
        theme: business.theme,
        categories: business.categories,
        products: business.products,
        info_sections: business.infoSections,
      })
      .eq("id", businessId);

    setSaving(false);
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("¡Cambios publicados en tu página!");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr("");
    setPasswordMsg("");

    if (newPassword.length < 6) {
      setPasswordErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr("Las contraseñas no coinciden.");
      return;
    }

    setUpdatingPass(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setUpdatingPass(false);

    if (error) {
      setPasswordErr("Error al actualizar contraseña: " + error.message);
    } else {
      setPasswordMsg("¡Contraseña actualizada correctamente!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 2 MB.");
      return;
    }
    const fileExt = file.name.split(".").pop();
    const filePath = `${business.slug}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from("business-assets").upload(filePath, file);
    if (error) {
      alert("Error al subir imagen: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("business-assets").getPublicUrl(filePath);
    if (data?.publicUrl) {
      onSuccess(data.publicUrl);
    }
  };

  const addProduct = () => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      category: business.categories.filter((c) => c !== "Todos")[0] || "",
      name: "Nuevo Producto",
      tag: "",
      description: "",
      keyAssets: [],
      benefits: "",
      imgUrl: "",
    };
    setBusiness({ ...business, products: [newProd, ...business.products] });
    setExpandedProductId(newId);
  };

  // Mover producto hacia arriba o hacia abajo en la lista
  const moveProduct = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= business.products.length) return;

    const updated = [...business.products];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBusiness({ ...business, products: updated });
  };

  const addInfoSection = () => {
    const current = business.infoSections || [];
    if (current.length >= 3) {
      alert("Máximo 3 tarjetas adicionales permitidas.");
      return;
    }
    const newId = `sec-${Date.now()}`;
    const newSec: InfoSection = {
      id: newId,
      badge: "Destacado",
      title: "Nueva Tarjeta Informativa",
      description: "Describe tu promoción, membresía o programa.",
      bullets: [{ bold: "Beneficio:", text: "Detalle del beneficio." }],
      ctaText: "Más información",
      whatsappMessage: "Hola, me interesa recibir más información.",
    };
    setBusiness({ ...business, infoSections: [...current, newSec] });
    setExpandedSectionId(newId);
  };

  if (loading) {
    return (
      <div className="lk-admin-page flex items-center justify-center">
        <p className="text-sm font-bold text-slate-400">Verificando sesión...</p>
      </div>
    );
  }

  const conversionRate =
    stats.views > 0 ? ((stats.whatsappClicks / stats.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="lk-admin-page pb-28">
      {/* BARRA SUPERIOR */}
      <header className="lk-admin-topbar">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-base tracking-tight text-slate-900 shrink-0">
              Linkni
            </span>

            {isMaster && allBusinesses.length > 0 ? (
              <select
                value={businessId || ""}
                onChange={(e) => {
                  const found = allBusinesses.find((b) => b.id === e.target.value);
                  if (found) selectBusinessRow(found);
                }}
                className="text-xs bg-indigo-50 text-indigo-950 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold truncate max-w-[200px] sm:max-w-xs cursor-pointer"
              >
                {allBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    👑 {b.name} ({b.email})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold truncate max-w-[160px]">
                {business.name}
              </span>
            )}
          </div>

          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="lk-admin-btn-secondary text-xs py-1.5 px-3 shrink-0"
          >
            Ver página ↗
          </a>
        </div>

        {/* 3 PESTAÑAS */}
        <div className="max-w-xl mx-auto px-4 grid grid-cols-3 text-center border-t border-slate-100">
          <button
            onClick={() => setActiveTab("metricas")}
            className={`lk-admin-tab ${activeTab === "metricas" ? "lk-admin-tab-active" : ""}`}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`lk-admin-tab ${activeTab === "editor" ? "lk-admin-tab-active" : ""}`}
          >
            Editar Página
          </button>
          <button
            onClick={() => setActiveTab("perfil")}
            className={`lk-admin-tab ${activeTab === "perfil" ? "lk-admin-tab-active" : ""}`}
          >
            Mi Perfil
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* ================= PESTAÑA 1: MÉTRICAS ================= */}
        {activeTab === "metricas" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="lk-admin-card p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Visitas</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.views}</p>
              </div>
              <div className="lk-admin-card p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.whatsappClicks}</p>
              </div>
              <div className="lk-admin-card p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Conversión</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{conversionRate}%</p>
              </div>
            </div>

            <div className="lk-admin-card">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Productos más solicitados
              </h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  Cuando tus clientes toquen "Me interesa", verás aquí el ranking.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((item, i) => {
                    const max = stats.topProducts[0].count || 1;
                    const pct = Math.round((item.count / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{item.name}</span>
                          <span className="text-slate-500">{item.count} clics</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%`, backgroundColor: "var(--linkni-accent)" }}
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PESTAÑA 2: EDITOR ================= */}
        {activeTab === "editor" && (
          <div className="space-y-6">
            {/* 1. IDENTIDAD, CONTACTO, REDES Y GOOGLE REVIEWS */}
            <section className="lk-admin-card space-y-5">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                1. Identidad y Contacto
              </h2>

              {/* Logo */}
              <div className="flex items-center gap-4">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt="Logo"
                    className="w-16 h-16 rounded-full object-contain border border-slate-200 p-1 bg-white shrink-0"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: business.theme.primary }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0"
                  >
                    {business.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <label className="lk-admin-btn-secondary w-full py-2 text-xs cursor-pointer">
                    📷 Subir o cambiar logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (url) =>
                            setBusiness({ ...business, logoUrl: url })
                          );
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O pega la URL del logo..."
                    value={business.logoUrl || ""}
                    onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })}
                    className="lk-admin-input text-xs py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="lk-admin-label">Nombre del Negocio</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="lk-admin-input"
                />
              </div>

              <div>
                <label className="lk-admin-label">Slogan</label>
                <input
                  type="text"
                  value={business.tagline}
                  onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                  className="lk-admin-input"
                />
              </div>

              <div>
                <label className="lk-admin-label">Descripción breve</label>
                <textarea
                  rows={2}
                  value={business.bio}
                  onChange={(e) => setBusiness({ ...business, bio: e.target.value })}
                  className="lk-admin-input"
                />
              </div>

              {/* Colores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lk-admin-label">Color Principal</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={business.theme.primary}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          theme: { ...business.theme, primary: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={business.theme.primary}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          theme: { ...business.theme, primary: e.target.value },
                        })
                      }
                      className="lk-admin-input uppercase text-xs px-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="lk-admin-label">Color Acento</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={business.theme.secondary}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          theme: { ...business.theme, secondary: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={business.theme.secondary}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          theme: { ...business.theme, secondary: e.target.value },
                        })
                      }
                      className="lk-admin-input uppercase text-xs px-2"
                    />
                  </div>
                </div>
              </div>

              {/* BOTONES ACTIVABLES CON CHECKBOX */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-500">
                  Marca con ✔ los botones que quieras mostrar en tu encabezado:
                </p>

                {/* 1. WHATSAPP + MENSAJE PRECARGADO */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={social.showWhatsapp !== false}
                      onChange={(e) => updateSocial({ showWhatsapp: e.target.checked })}
                      className="w-4 h-4 rounded accent-slate-900"
                    />
                    Mostrar botón de WhatsApp
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="lk-admin-label">Número (con código de país, ej. 5281...)</label>
                      <input
                        type="tel"
                        value={business.whatsapp}
                        onChange={(e) => setBusiness({ ...business, whatsapp: e.target.value })}
                        placeholder="528100000000"
                        className="lk-admin-input"
                      />
                    </div>
                    <div>
                      <label className="lk-admin-label">Mensaje precargado al abrir WhatsApp</label>
                      <input
                        type="text"
                        value={social.whatsappMessage || ""}
                        onChange={(e) => updateSocial({ whatsappMessage: e.target.value })}
                        placeholder={`Hola, me gustaría información sobre ${business.name}`}
                        className="lk-admin-input"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. REDES SOCIALES (INSTAGRAM, FACEBOOK, TIKTOK) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Instagram */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ Boolean(social.showInstagram) }
                        onChange={(e) => updateSocial({ showInstagram: e.target.checked })}
                        className="w-4 h-4 rounded accent-slate-900"
                      />
                      Instagram
                    </label>
                    <input
                      type="text"
                      placeholder="usuario (sin @)"
                      value={business.instagram || ""}
                      onChange={(e) => setBusiness({ ...business, instagram: e.target.value })}
                      className="lk-admin-input text-xs"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ Boolean(social.showFacebook) }
                        onChange={(e) => updateSocial({ showFacebook: e.target.checked })}
                        className="w-4 h-4 rounded accent-slate-900"
                      />
                      Facebook
                    </label>
                    <input
                      type="text"
                      placeholder="usuario o página"
                      value={business.facebook || ""}
                      onChange={(e) => setBusiness({ ...business, facebook: e.target.value })}
                      className="lk-admin-input text-xs"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ Boolean(social.showTiktok) }
                        onChange={(e) => updateSocial({ showTiktok: e.target.checked })}
                        className="w-4 h-4 rounded accent-slate-900"
                      />
                      TikTok
                    </label>
                    <input
                      type="text"
                      placeholder="usuario (sin @)"
                      value={social.tiktok || ""}
                      onChange={(e) => updateSocial({ tiktok: e.target.value })}
                      className="lk-admin-input text-xs"
                    />
                  </div>
                </div>

                {/* 3. ENLACE PERSONALIZADO (NOMBRE + URL) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ Boolean(social.showCustomLink) }
                      onChange={(e) => updateSocial({ showCustomLink: e.target.checked })}
                      className="w-4 h-4 rounded accent-slate-900"
                    />
                    Mostrar Enlace Personalizado (Ubicación, Sitio Web, Catálogo, etc.)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="lk-admin-label">Nombre del botón</label>
                      <input
                        type="text"
                        placeholder="Ej. Ver Ubicación / Sitio Web"
                        value={social.customLinkLabel || ""}
                        onChange={(e) => updateSocial({ customLinkLabel: e.target.value })}
                        className="lk-admin-input"
                      />
                    </div>
                    <div>
                      <label className="lk-admin-label">Enlace (URL)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={social.customLinkUrl || ""}
                        onChange={(e) => updateSocial({ customLinkUrl: e.target.value })}
                        className="lk-admin-input"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. RESEÑAS DE GOOGLE (GOOGLE REVIEWS) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ Boolean(social.showGoogleReviews) }
                      onChange={(e) => updateSocial({ showGoogleReviews: e.target.checked })}
                      className="w-4 h-4 rounded accent-slate-900"
                    />
                    ⭐ Mostrar botón de Reseñas de Google (Google Reviews)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="lk-admin-label">Calificación (Estrellas)</label>
                      <input
                        type="text"
                        placeholder="Ej. 4.9"
                        value={social.googleRating || ""}
                        onChange={(e) => updateSocial({ googleRating: e.target.value })}
                        className="lk-admin-input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="lk-admin-label">Enlace a tus reseñas en Google Maps</label>
                      <input
                        type="url"
                        placeholder="https://g.page/r/..."
                        value={social.googleReviewsUrl || ""}
                        onChange={(e) => updateSocial({ googleReviewsUrl: e.target.value })}
                        className="lk-admin-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. CATEGORÍAS */}
            {business.templateType !== "contacto-perfil" && (
              <section className="lk-admin-card space-y-3">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  2. Categorías (Opcional)
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {business.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() =>
                          setBusiness({
                            ...business,
                            categories: business.categories.filter((c) => c !== cat),
                          })
                        }
                        className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nueva categoría..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="lk-admin-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCategory.trim();
                      if (trimmed && !business.categories.includes(trimmed)) {
                        setBusiness({
                          ...business,
                          categories: [...business.categories, trimmed],
                        });
                        setNewCategory("");
                      }
                    }}
                    className="lk-admin-btn-secondary shrink-0"
                  >
                    + Añadir
                  </button>
                </div>
              </section>
            )}

            {/* 3. PRODUCTOS (ORDENABLES Y SIN PRECIO EN MENÚ INFORMATIVO) */}
            <section className="lk-admin-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    3. Productos ({business.products.length})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Usa las flechas ↑ ↓ para ordenarlos a tu gusto
                  </p>
                </div>
                <button type="button" onClick={addProduct} className="lk-admin-btn text-xs py-2 px-3">
                  + Nuevo
                </button>
              </div>

              <div className="space-y-2.5">
                {business.products.map((prod, idx) => {
                  const isOpen = expandedProductId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <div className="px-3 py-3 flex items-center justify-between gap-2 hover:bg-slate-50">
                        {/* Botones para subir / bajar el orden del producto */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveProduct(idx, "up")}
                            className="text-[10px] leading-none px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Subir"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === business.products.length - 1}
                            onClick={() => moveProduct(idx, "down")}
                            className="text-[10px] leading-none px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Bajar"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Título del Producto */}
                        <button
                          type="button"
                          onClick={() => setExpandedProductId(isOpen ? null : prod.id)}
                          className="flex-1 flex items-center justify-between text-left min-w-0 cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-bold text-slate-900 truncate">{prod.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {prod.category || "Sin categoría"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-400 shrink-0">
                            {isOpen ? "Cerrar ▲" : "Editar ▼"}
                          </span>
                        </button>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
                          <div className="grid grid-cols-2 gap-2.5">
                            <div
                              className={
                                business.templateType === "tienda-pedidos"
                                  ? "col-span-2 sm:col-span-1"
                                  : "col-span-2"
                              }
                            >
                              <label className="lk-admin-label">Nombre</label>
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) => {
                                  const updated = [...business.products];
                                  updated[idx].name = e.target.value;
                                  setBusiness({ ...business, products: updated });
                                }}
                                className="lk-admin-input font-semibold"
                              />
                            </div>

                            {/* PRECIO: Solo se muestra si la plantilla es 'tienda-pedidos' */}
                            {business.templateType === "tienda-pedidos" && (
                              <div className="col-span-2 sm:col-span-1">
                                <label className="lk-admin-label">Precio</label>
                                <input
                                  type="text"
                                  placeholder="Ej. $85 MXN"
                                  value={prod.price || ""}
                                  onChange={(e) => {
                                    const updated = [...business.products];
                                    updated[idx].price = e.target.value;
                                    setBusiness({ ...business, products: updated });
                                  }}
                                  className="lk-admin-input"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {business.categories.length > 0 && (
                              <div>
                                <label className="lk-admin-label">Categoría</label>
                                <select
                                  value={prod.category || ""}
                                  onChange={(e) => {
                                    const updated = [...business.products];
                                    updated[idx].category = e.target.value;
                                    setBusiness({ ...business, products: updated });
                                  }}
                                  className="lk-admin-input"
                                >
                                  <option value="">Sin categoría</option>
                                  {business.categories.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className={business.categories.length > 0 ? "" : "col-span-2"}>
                              <label className="lk-admin-label">Etiqueta (Tag superior)</label>
                              <input
                                type="text"
                                placeholder="Ej. V-NEUROKAFE"
                                value={prod.tag || ""}
                                onChange={(e) => {
                                  const updated = [...business.products];
                                  updated[idx].tag = e.target.value;
                                  setBusiness({ ...business, products: updated });
                                }}
                                className="lk-admin-input"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="lk-admin-label">Descripción</label>
                            <textarea
                              rows={2}
                              value={prod.description}
                              onChange={(e) => {
                                const updated = [...business.products];
                                updated[idx].description = e.target.value;
                                setBusiness({ ...business, products: updated });
                              }}
                              className="lk-admin-input"
                            />
                          </div>

                          <div>
                            <label className="lk-admin-label">
                              Ingredientes / Características (separados por coma)
                            </label>
                            <input
                              type="text"
                              value={(prod.keyAssets || []).join(", ")}
                              onChange={(e) => {
                                const updated = [...business.products];
                                updated[idx].keyAssets = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                setBusiness({ ...business, products: updated });
                              }}
                              className="lk-admin-input"
                            />
                          </div>

                          <div>
                            <label className="lk-admin-label">Beneficios</label>
                            <textarea
                              rows={2}
                              value={prod.benefits || ""}
                              onChange={(e) => {
                                const updated = [...business.products];
                                updated[idx].benefits = e.target.value;
                                setBusiness({ ...business, products: updated });
                              }}
                              className="lk-admin-input"
                            />
                          </div>

                          <div>
                            <label className="lk-admin-label">Imagen del Producto</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="URL de la foto..."
                                value={prod.imgUrl || ""}
                                onChange={(e) => {
                                  const updated = [...business.products];
                                  updated[idx].imgUrl = e.target.value;
                                  setBusiness({ ...business, products: updated });
                                }}
                                className="lk-admin-input text-xs"
                              />
                              <label className="lk-admin-btn-secondary shrink-0 cursor-pointer">
                                📷 Subir
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(file, (url) => {
                                        const updated = [...business.products];
                                        updated[idx].imgUrl = url;
                                        setBusiness({ ...business, products: updated });
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setBusiness({
                                  ...business,
                                  products: business.products.filter((p) => p.id !== prod.id),
                                })
                              }
                              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              Eliminar producto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. TARJETAS INFORMATIVAS ADICIONALES */}
            <section className="lk-admin-card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  4. Tarjetas Adicionales ({(business.infoSections || []).length}/3)
                </h2>
                <button
                  type="button"
                  onClick={addInfoSection}
                  className="lk-admin-btn-secondary text-xs py-1.5 px-3"
                >
                  + Agregar
                </button>
              </div>

              <div className="space-y-2.5">
                {(business.infoSections || []).map((sec, idx) => {
                  const isOpen = expandedSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSectionId(isOpen ? null : sec.id)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{sec.title}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{sec.badge}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          {isOpen ? "Cerrar ▲" : "Editar ▼"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
                          <div>
                            <label className="lk-admin-label">Subtítulo superior (Badge)</label>
                            <input
                              type="text"
                              value={sec.badge || ""}
                              onChange={(e) => {
                                const updated = [...(business.infoSections || [])];
                                updated[idx].badge = e.target.value;
                                setBusiness({ ...business, infoSections: updated });
                              }}
                              className="lk-admin-input"
                            />
                          </div>

                          <div>
                            <label className="lk-admin-label">Título</label>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const updated = [...(business.infoSections || [])];
                                updated[idx].title = e.target.value;
                                setBusiness({ ...business, infoSections: updated });
                              }}
                              className="lk-admin-input font-bold"
                            />
                          </div>

                          <div>
                            <label className="lk-admin-label">Descripción</label>
                            <textarea
                              rows={2}
                              value={sec.description}
                              onChange={(e) => {
                                const updated = [...(business.infoSections || [])];
                                updated[idx].description = e.target.value;
                                setBusiness({ ...business, infoSections: updated });
                              }}
                              className="lk-admin-input"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="lk-admin-label">Texto del Botón</label>
                              <input
                                type="text"
                                value={sec.ctaText}
                                onChange={(e) => {
                                  const updated = [...(business.infoSections || [])];
                                  updated[idx].ctaText = e.target.value;
                                  setBusiness({ ...business, infoSections: updated });
                                }}
                                className="lk-admin-input"
                              />
                            </div>
                            <div>
                              <label className="lk-admin-label">Mensaje de WhatsApp</label>
                              <input
                                type="text"
                                value={sec.whatsappMessage}
                                onChange={(e) => {
                                  const updated = [...(business.infoSections || [])];
                                  updated[idx].whatsappMessage = e.target.value;
                                  setBusiness({ ...business, infoSections: updated });
                                }}
                                className="lk-admin-input"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setBusiness({
                                  ...business,
                                  infoSections: (business.infoSections || []).filter(
                                    (s) => s.id !== sec.id
                                  ),
                                })
                              }
                              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              Eliminar tarjeta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ================= PESTAÑA 3: MI PERFIL + CONTRASEÑA ================= */}
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <div className="lk-admin-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Plan Activo
                </span>
                {isMaster && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    👑 Super Admin (Master)
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Plantilla: {business.templateType}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sesión iniciada como: <strong>{userEmail}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  URL pública:{" "}
                  <a
                    href={`/${business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 underline"
                  >
                    /{business.slug}
                  </a>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.replace("/login");
                  }}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="lk-admin-card space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Cambiar o establecer mi contraseña
              </h3>

              <div>
                <label className="lk-admin-label">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="lk-admin-input"
                />
              </div>

              <div>
                <label className="lk-admin-label">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="lk-admin-input"
                />
              </div>

              {passwordErr && <p className="text-xs text-red-600 font-semibold">{passwordErr}</p>}
              {passwordMsg && (
                <p className="text-xs text-emerald-600 font-semibold">{passwordMsg}</p>
              )}

              <button type="submit" disabled={updatingPass} className="lk-admin-btn py-2.5 px-5">
                {updatingPass ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* BOTÓN FIJO ABAJO EN MÓVIL PARA GUARDAR */}
      {activeTab === "editor" && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40">
          <div className="max-w-xl mx-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="lk-admin-btn w-full py-3.5 text-sm shadow-md"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}