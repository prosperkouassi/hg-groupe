"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

type AdminShellProps = {
  children: ReactNode;

  admin: {
    name: string;
    email: string;
  };
};

export default function AdminShell({
  children,
  admin,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de se déconnecter."
        );
      }

      router.replace("/admin/connexion");
      router.refresh();
    } catch (error) {
      console.error(error);
      setLogoutLoading(false);
    }
  }

  const navigation = [
    { label: "Partenaires", href: "/admin/partenaires", icon: <span aria-hidden="true" className="text-xl">◇</span> },
    {
      label: "Projets",
      href: "/admin/projets",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path
            d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4l1.5 2h7.5A1.5 1.5 0 0 1 20 9.5v8A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#081426]">
      <div className="flex min-h-screen">
        {/* =====================================================
            SIDEBAR DESKTOP
        ====================================================== */}

        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col bg-[#050B16] text-white lg:flex">
          {/* Logo */}

          <div className="flex h-[92px] items-center border-b border-white/10 px-8">
            <Link
              href="/admin/projets"
              className="flex items-center gap-4"
              style={{
                color: "#FFFFFF",
              }}
            >
              <div className="h-9 w-9 shrink-0">
                <img
                  src="/images/logo-hg-animated.svg"
                  alt="Hopla Groupe"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p
                  className="text-sm font-semibold tracking-[-0.02em]"
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  Hopla Groupe
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/35">
                  Administration
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}

          <nav className="flex-1 px-4 py-8">
            <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              Gestion
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all duration-300",
                      active
                        ? "bg-white/10"
                        : "hover:bg-white/[0.05]",
                    ].join(" ")}
                    style={{
                      color: active
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.58)",
                    }}
                  >
                    <span
                      style={{
                        color: active
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.40)",
                      }}
                    >
                      {item.icon}
                    </span>

                    <span
                      style={{
                        color: active
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.58)",
                      }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Site */}

            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                Site
              </p>

              <Link
                href="/"
                target="_blank"
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all duration-300 hover:bg-white/[0.05]"
                style={{
                  color:
                    "rgba(255,255,255,0.58)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                  style={{
                    color:
                      "rgba(255,255,255,0.4)",
                  }}
                >
                  <path
                    d="M14 5h5v5M19 5l-7 7M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  Voir le site
                </span>
              </Link>
            </div>
          </nav>

          {/* Profil */}

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[18px] bg-white/[0.045] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A58] to-[#993578] text-sm font-semibold text-white">
                  {admin.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{
                      color: "#FFFFFF",
                    }}
                  >
                    {admin.name}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-white/35">
                    {admin.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="mt-4 flex min-h-[46px] w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-xs font-semibold transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  color: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  {logoutLoading
                    ? "Déconnexion..."
                    : "Se déconnecter"}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* =====================================================
            CONTENU
        ====================================================== */}

        <div className="min-w-0 flex-1 lg:pl-[270px]">
          {/* Header mobile */}

          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#081426]/10 bg-[#F7F4EF]/90 px-5 backdrop-blur-xl sm:px-7 lg:hidden">
            <Link
              href="/admin/projets"
              className="flex items-center gap-3"
              style={{
                color: "#081426",
              }}
            >
              <div className="h-8 w-8">
                <img
                  src="/images/logo-hg-animated.svg"
                  alt="Hopla Groupe"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#081426]">
                  Hopla
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Administration
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex h-10 items-center justify-center rounded-full border border-[#081426]/10 bg-white px-4 text-xs font-semibold"
                style={{
                  color: "#081426",
                }}
              >
                Voir le site
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex h-10 items-center justify-center rounded-full bg-[#081426] px-4 text-xs font-semibold disabled:opacity-40"
                style={{
                  color: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  Quitter
                </span>
              </button>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}