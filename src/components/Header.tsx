"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Expertises", href: "/expertises" },
  { label: "Cas d'études", href: "/cas-etudes" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",

        isHome
          ? scrolled
            ? "border-b border-white/10 bg-[#050b16]/90 backdrop-blur-xl"
            : "bg-transparent"
          : "border-b border-[#081426]/10 bg-white",
      ].join(" ")}
    >
      <div className="container-hopla flex h-20 items-center justify-between lg:h-24">
        {/* LOGO */}
        <Link
          href="/"
          className="z-50 flex items-center gap-3"
          aria-label="Retour à l'accueil"
        >
          <div className="h-10 w-10 flex-shrink-0 lg:h-11 lg:w-11">
            <img
              src="/images/logo-hg-animated.svg"
              alt="Logo Hopla Groupe"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex h-7 items-center lg:h-8">
            <img
              src="/images/hopla-groupe.png"
              alt="Hopla Groupe"
              className="h-full w-auto object-contain"
            />
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative text-sm font-medium transition-colors duration-300",

                isHome
                  ? "text-white/70 hover:text-white"
                  : "!text-[#081426] hover:!text-[#081426]",
              ].join(" ")}
            >
              {item.label}

              <span className="absolute -bottom-2 left-0 h-px w-0 bg-gradient-to-r from-[#FF7A58] to-[#993578] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://alteractweb.com"
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300",

              isHome
                ? "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
                : "border-[#081426]/15 !text-[#081426] hover:border-[#081426]/30 hover:bg-[#081426]/5 hover:!text-[#081426]",
            ].join(" ")}
          >
            AlteractWeb ↗
          </a>

          <a
            href="https://strategaction.com"
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300",

              isHome
                ? "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
                : "border-[#081426]/15 !text-[#081426] hover:border-[#081426]/30 hover:bg-[#081426]/5 hover:!text-[#081426]",
            ].join(" ")}
          >
            Stratège Action ↗
          </a>

          <Link
            href="/contact"
            className="group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#FF7A58] to-[#993578] transition-transform duration-500 group-hover:scale-110" />

            <span className="relative z-10">
              Nous contacter
            </span>
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <span className="flex w-5 flex-col gap-1.5">
            <span
              className={[
                "h-px w-full",
                isHome ? "bg-white" : "bg-[#081426]",
              ].join(" ")}
            />

            <span
              className={[
                "h-px w-full",
                isHome ? "bg-white" : "bg-[#081426]",
              ].join(" ")}
            />
          </span>
        </button>
      </div>
    </header>
  );
}