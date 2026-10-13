"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard?reset=true`,
    });

    setLoading(false);
    if (error) {
      setError("No se pudo enviar el correo: " + error.message);
    } else {
      setMessage(
        "Te enviamos un enlace a tu correo. Tócalo para crear o cambiar tu contraseña."
      );
    }
  };

  return (
    <div className="lk-admin-page flex items-center justify-center px-4">
      <div className="lk-admin-card w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Linkni</h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "login"
              ? "Accede a tu panel para editar tu página"
              : "Ingresa tu correo para crear o restablecer tu contraseña"}
          </p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="lk-admin-label">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="lk-admin-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="lk-admin-label mb-0">Contraseña</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setMessage("");
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  ¿Olvidaste o no tienes contraseña?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="lk-admin-input"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            {message && <p className="text-xs text-emerald-600 font-semibold">{message}</p>}

            <button type="submit" disabled={loading} className="lk-admin-btn w-full py-3">
              {loading ? "Entrando..." : "Iniciar Sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="lk-admin-label">Correo electrónico de tu cuenta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="lk-admin-input"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            {message && <p className="text-xs text-emerald-600 font-semibold">{message}</p>}

            <button type="submit" disabled={loading} className="lk-admin-btn w-full py-3">
              {loading ? "Enviando enlace..." : "Enviar enlace a mi correo"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-1 cursor-pointer"
            >
              ← Volver a Iniciar Sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}