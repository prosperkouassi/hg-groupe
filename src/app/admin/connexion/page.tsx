"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Impossible de vous connecter."
        );

        setLoading(false);

        return;
      }

      router.push("/admin/projets");
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B16] text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-15%] top-[-20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,122,88,0.16)_0%,rgba(153,53,120,0.05)_45%,transparent_72%)] blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-25%] right-[-15%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(116,232,160,0.12)_0%,rgba(42,120,83,0.04)_45%,transparent_72%)] blur-3xl"
        />

        <div className="relative z-10 w-full max-w-[440px]">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 h-14 w-14">
              <img
                src="/images/logo-hg-animated.svg"
                alt="Hopla Groupe"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
              Hopla Groupe
            </p>

            <h1 className="mt-4 text-[clamp(2rem,6vw,3.3rem)] font-semibold leading-none tracking-[-0.045em]">
              Administration
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/45">
              Connectez-vous pour gérer les cas
              d&apos;études.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl md:p-8"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45"
              >
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors duration-300 placeholder:text-white/20 focus:border-white/25"
                placeholder="contact@hoplagroupe.com"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/45"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors duration-300 placeholder:text-white/20 focus:border-white/25"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex h-13 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A58] to-[#993578] px-6 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Connexion..."
                : "Se connecter"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <a
              href="/"
              className="text-xs font-medium text-white/35 transition-colors duration-300 hover:text-white"
            >
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}