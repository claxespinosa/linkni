"use client";

import React, { useState, useEffect } from "react";

interface BackToTopProps {
  color?: string;
  threshold?: number;
}

export default function BackToTop({ color = "#111827", threshold = 300 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Evaluación inicial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      style={{ backgroundColor: color }}
      className="fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full text-white shadow-xl shadow-black/25 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}