"use client";

import React, { useState, useEffect } from "react";
import { BusinessProfile, Product } from "../../data/businesses";

interface StoreOrdersTemplateProps {
  business: BusinessProfile;
  onTrackEvent?: (
    type: "whatsapp_click" | "product_click" | "checkout_intent",
    itemName?: string,
    value?: number
  ) => void;
}

// Estructura del carrito: la key es "id-opcion"
interface CartItem {
  product: Product;
  qty: number;
  selectedOption: string;
  notes: string;
}

export default function StoreOrdersTemplate({
  business,
  onTrackEvent,
}: StoreOrdersTemplateProps) {
  const { categories, products, storeConfig } = business;

  const sc = storeConfig || {
    isOpen: true,
    closedMessage: "Cerrado por el momento.",
    shippingCost: 0,
    minOrder: 0,
  };

  const displayCategories = (categories || []).filter((c) => c !== "Todos");
  const hasCategories = displayCategories.length > 0;
  const [activeCategory, setActiveCategory] = useState(displayCategories[0] || "");

  // ==== ESTADOS DEL CARRITO Y MODAL ====
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");

  // Formularios
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo al recibir");

  // Estado temporal de las variantes seleccionadas por el usuario en cada tarjeta de producto
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Cargar LocalStorage al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(`linkni_cart_${business.slug}`);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedCust = localStorage.getItem(`linkni_cust_${business.slug}`);
      if (savedCust) {
        const { n, p, a } = JSON.parse(savedCust);
        if (n) setCustName(n);
        if (p) setCustPhone(p);
        if (a) setCustAddress(a);
      }
    } catch (e) {}
  }, [business.slug]);

  // Guardar en LocalStorage al cambiar el carrito
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem(`linkni_cart_${business.slug}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`linkni_cart_${business.slug}`);
    }
  }, [cart, business.slug]);

  // ==== CÁLCULOS DEL CARRITO ====
  let totalItems = 0;
  let subtotalCart = 0;
  Object.values(cart).forEach((item) => {
    totalItems += item.qty;
    const pPrice = parseFloat(item.product.price?.replace(/[^0-9.]/g, "") || "0");
    subtotalCart += pPrice * item.qty;
  });

  const finalShippingCost = deliveryType === "delivery" ? sc.shippingCost || 0 : 0;
  const grandTotal = subtotalCart + finalShippingCost;
  const meetsMinOrder = subtotalCart >= (sc.minOrder || 0);

  // ==== FUNCIONES DEL CARRITO ====
  const getProductOptions = (prod: Product) => {
    if (!prod.options) return [];
    return prod.options.split(",").map((o) => o.trim()).filter(Boolean);
  };

  const handleUpdateQty = (prod: Product, delta: number) => {
    const opts = getProductOptions(prod);
    // Si tiene opciones, usamos la seleccionada o la primera por defecto
    const currentOpt = opts.length > 0 ? selectedOptions[prod.id] || opts[0] : "";
    const cartKey = `${prod.id}-${currentOpt}`;

    setCart((prev) => {
      const existing = prev[cartKey];
      const newQty = (existing?.qty || 0) + delta;

      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[cartKey];
        return updated;
      }

      return {
        ...prev,
        [cartKey]: {
          product: prod,
          selectedOption: currentOpt,
          qty: newQty,
          notes: existing?.notes || "",
        },
      };
    });
  };

  const handleUpdateNote = (cartKey: string, note: string) => {
    setCart((prev) => {
      if (!prev[cartKey]) return prev;
      return { ...prev, [cartKey]: { ...prev[cartKey], notes: note } };
    });
  };

  // ==== SCROLL Y TABS ====
  const scrollToSection = (catName: string) => {
    setActiveCategory(catName);
    const element = document.getElementById(`section-${catName}`);
    if (element) {
      const headerOffset = 92;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // ==== ENVÍO A WHATSAPP ====
  const generateOrderId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sc.isOpen) return;

    // Guardar datos de cliente temporalmente
    localStorage.setItem(
      `linkni_cust_${business.slug}`,
      JSON.stringify({ n: custName, p: custPhone, a: custAddress })
    );

    const orderId = generateOrderId();
    let itemsText = "";

    Object.values(cart).forEach((item) => {
      const price = parseFloat(item.product.price?.replace(/[^0-9.]/g, "") || "0");
      const lineTotal = price * item.qty;
      const optStr = item.selectedOption ? ` [${item.selectedOption}]` : "";
      const noteStr = item.notes ? `\n   ↳ _Nota: ${item.notes}_` : "";
      
      itemsText += `▫️ ${item.qty}x ${item.product.name}${optStr} ($${lineTotal.toFixed(2)})${noteStr}\n`;
    });

    const deliveryLabel = deliveryType === "delivery" ? "🛵 A Domicilio" : "🏪 Recoger en Tienda (Pick-up)";
    const addressLabel = deliveryType === "delivery" ? `🏠 *Dirección:* ${custAddress}` : "";
    const shippingLabel = deliveryType === "delivery" && finalShippingCost > 0 
      ? `\n🚚 *Envío:* $${finalShippingCost.toFixed(2)}` 
      : "";

    const message = `🛒 *NUEVO PEDIDO - ${business.name.toUpperCase()}*
🔖 *Folio:* #${orderId}
📦 *Modalidad:* ${deliveryLabel}
--------------------------------------
👤 *Cliente:* ${custName}
📱 *Teléfono:* ${custPhone}
${addressLabel}
💳 *Pago:* ${paymentMethod}
--------------------------------------
📋 *PRODUCTOS:*
${itemsText}${shippingLabel}
💰 *TOTAL A PAGAR: $${grandTotal.toFixed(2)}*
--------------------------------------
_Guarde su folio (#${orderId}) para su entrega._`;

    // Registrar en analíticas el valor total generado (Para el Dashboard del cliente)
    if (onTrackEvent) {
      onTrackEvent("checkout_intent", "WhatsApp Order", grandTotal);
    }

    setCart({}); // Limpiar carrito
    setIsCheckoutOpen(false);

    const encodedURL = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(encodedURL, "_blank");
  };

  // ==== RENDER DE PRODUCTO ====
  const renderProductCard = (item: Product) => {
    const opts = getProductOptions(item);
    const hasOpts = opts.length > 0;
    const currentOpt = hasOpts ? selectedOptions[item.id] || opts[0] : "";
    const cartKey = `${item.id}-${currentOpt}`;
    const qtyInCart = cart[cartKey]?.qty || 0;

    return (
      <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden p-3">
        <div>
          <div className="relative w-full h-32 mb-2 bg-slate-50 rounded-lg overflow-hidden">
            {item.imgUrl ? (
              <img src={item.imgUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {item.tag && (
              <span className="absolute top-1 left-1 bg-gray-900/80 text-white font-bold text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                {item.tag}
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{item.description}</p>
        </div>

        <div className="mt-3">
          <div className="mb-2">
            <span className="text-base font-black" style={{ color: business.theme.primary }}>
              {item.price || "$0.00"}
            </span>
          </div>

          {/* Selector de Variante */}
          {hasOpts && (
            <select
              value={currentOpt}
              onChange={(e) => setSelectedOptions({ ...selectedOptions, [item.id]: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded p-1.5 mb-2 bg-slate-50 focus:outline-none focus:border-slate-400"
            >
              {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}

          {/* Botones de Agregar / Quitar */}
          <div className="w-full">
            {qtyInCart === 0 ? (
              <button
                onClick={() => handleUpdateQty(item, 1)}
                disabled={!sc.isOpen}
                className="w-full text-white font-bold py-2 text-xs rounded-lg transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                style={{ backgroundColor: business.theme.primary }}
              >
                + Agregar
              </button>
            ) : (
              <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => handleUpdateQty(item, -1)}
                  className="w-8 h-8 bg-white text-gray-700 rounded shadow-sm font-bold flex items-center justify-center active:scale-90"
                >
                  -
                </button>
                <span className="font-bold text-sm text-gray-900">{qtyInCart}</span>
                <button
                  onClick={() => handleUpdateQty(item, 1)}
                  className="w-8 h-8 text-white rounded shadow-sm font-bold flex items-center justify-center active:scale-90"
                  style={{ backgroundColor: business.theme.primary }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="pb-32 bg-slate-50 min-h-screen">
      {/* HEADER DE LA TIENDA */}
      <header className="bg-white shadow-sm sticky top-0 z-30 pb-2">
        <div className="max-w-xl mx-auto px-4 py-3">
          <h1 className="text-xl font-black tracking-tight text-gray-900">{business.name}</h1>
          <p className="text-[11px] text-gray-500">{business.tagline || "Realiza tu pedido en línea"}</p>
        </div>

        {/* TABS DE CATEGORÍAS HORIZONTALES */}
        {hasCategories && (
          <div className="px-3 border-t border-slate-100">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 max-w-xl mx-auto">
              {displayCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToSection(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat ? "text-white" : "bg-slate-100 text-slate-600"
                  }`}
                  style={{ backgroundColor: activeCategory === cat ? business.theme.primary : undefined }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* AVISO DE TIENDA CERRADA */}
      {!sc.isOpen && (
        <div className="max-w-xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold p-3 rounded-lg text-center shadow-sm">
            🛑 {sc.closedMessage}
          </div>
        </div>
      )}

      {/* CATÁLOGO EN GRID (2 COLUMNAS MÓVIL, 3 TABLET) */}
      <div className="max-w-xl mx-auto px-4 mt-4">
        {hasCategories ? (
          <div className="flex flex-col gap-6">
            {displayCategories.map((catName) => {
              const catProds = products.filter((p) => p.category === catName);
              if (catProds.length === 0) return null;
              return (
                <section key={catName} id={`section-${catName}`}>
                  <h2 className="text-lg font-black text-gray-900 mb-3">{catName}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {catProds.map((item) => renderProductCard(item))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((item) => renderProductCard(item))}
          </div>
        )}
      </div>

      {/* BARRA FLOTANTE DEL CARRITO */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-3 transition-transform duration-300 ${
          totalItems > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">{totalItems} artículos</span>
            <span className="text-lg font-black text-gray-900">${subtotalCart.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={!sc.isOpen || !meetsMinOrder}
            className="flex-1 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
            style={{ backgroundColor: (!sc.isOpen || !meetsMinOrder) ? undefined : business.theme.primary }}
          >
            {!sc.isOpen
              ? "Tienda Cerrada"
              : !meetsMinOrder
              ? `Faltan $${(sc.minOrder! - subtotalCart).toFixed(2)}`
              : "Ver Pedido"}
          </button>
        </div>
      </div>

      {/* MODAL DE CHECKOUT */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
            
            {/* Header Modal */}
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-gray-900 text-lg">Resumen de Pedido</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            {/* Contenido Desplazable */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Lista de Carrito con inputs para Notas */}
              <div className="divide-y divide-slate-100">
                {Object.entries(cart).map(([key, item]) => {
                  const itemPrice = parseFloat(item.product.price?.replace(/[^0-9.]/g, "") || "0");
                  return (
                    <div key={key} className="py-3 flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <div className="pr-2 font-medium text-gray-900">
                          {item.product.name}
                          {item.selectedOption && <span className="text-gray-500"> ({item.selectedOption})</span>}
                          <div className="text-gray-500 mt-0.5">{item.qty} x {item.product.price}</div>
                        </div>
                        <span className="font-bold text-gray-900">${(itemPrice * item.qty).toFixed(2)}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Nota especial (ej. sin cebolla, salsa aparte)..."
                        value={item.notes}
                        onChange={(e) => handleUpdateNote(key, e.target.value)}
                        className="w-full text-[11px] p-1.5 border border-slate-200 rounded focus:border-slate-400 focus:outline-none bg-slate-50 mt-1"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${subtotalCart.toFixed(2)}</span>
                </div>
                {deliveryType === "delivery" && sc.shippingCost! > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Envío</span>
                    <span>${sc.shippingCost?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-gray-900 pt-1">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Formulario */}
              <form id="checkout-form" onSubmit={submitOrder} className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Modalidad de entrega *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`py-2.5 text-xs font-bold rounded-lg border text-center transition ${
                        deliveryType === "delivery" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      🛵 A Domicilio
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`py-2.5 text-xs font-bold rounded-lg border text-center transition ${
                        deliveryType === "pickup" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      🏪 Recoger (Pick-up)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo *</label>
                  <input type="text" required value={custName} onChange={(e) => setCustName(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:border-slate-400 focus:outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp (10 dígitos) *</label>
                  <input type="tel" pattern="[0-9]{10}" required value={custPhone} onChange={(e) => setCustPhone(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:border-slate-400 focus:outline-none bg-slate-50" />
                </div>
                
                {deliveryType === "delivery" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Completa *</label>
                    <textarea rows={2} required value={custAddress} onChange={(e) => setCustAddress(e.target.value)} placeholder="Calle, número, colonia..." className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:border-slate-400 focus:outline-none bg-slate-50"></textarea>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Forma de Pago *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:border-slate-400 focus:outline-none">
                    <option value="Efectivo al recibir">Efectivo al recibir</option>
                    <option value="Terminal al recibir">Terminal bancaria al recibir</option>
                    <option value="Transferencia anticipada">Transferencia anticipada</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-white">
              <button
                type="submit"
                form="checkout-form"
                className="w-full text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                style={{ backgroundColor: business.theme.primary }}
              >
                Enviar a WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}