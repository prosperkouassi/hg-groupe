"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Expertises", href: "/expertises" },
  { label: "Cas d'études", href: "/cas-etudes" },
  { label: "À propos", href: "/a-propos" },
  { label: "Blog", href: "/blog" },
  { label: "Recrutement", href: "/recrutement" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",

        isHome
          ? menuOpen
            ? "border-b border-white/10 bg-[#050b16]"
            : scrolled
              ? "border-b border-white/10 bg-[#050b16]/90 backdrop-blur-xl"
              : "bg-transparent"
          : menuOpen
            ? "border-b border-white/10 bg-[#050b16]"
            : "border-b border-[#081426]/10 bg-white",
      ].join(" ")}
    >
      <div className="container-hopla relative z-50 flex h-20 items-center justify-between lg:h-24">
        {/* LOGO */}
        <Link
          href="/"
          className="z-50 flex items-center gap-3"
          aria-label="Retour à l'accueil"
          onClick={() => setMenuOpen(false)}
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
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className={[
            "relative z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 lg:hidden",

            menuOpen
              ? "border-white/10 bg-white/5"
              : isHome
                ? "border-white/10 bg-white/5"
                : "border-[#081426]/10 bg-[#081426]/5",
          ].join(" ")}
        >
          <span className="relative block h-5 w-5">
            <span
              className={[
                "absolute left-0 top-[7px] h-px w-full transition-all duration-300",
                menuOpen || isHome ? "bg-white" : "bg-[#081426]",
                menuOpen ? "translate-y-[3px] rotate-45" : "",
              ].join(" ")}
            />

            <span
              className={[
                "absolute left-0 top-[13px] h-px w-full transition-all duration-300",
                menuOpen || isHome ? "bg-white" : "bg-[#081426]",
                menuOpen ? "-translate-y-[3px] -rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      <div
        id="mobile-navigation"
        className={[
          "fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-[#050b16] transition-all duration-500 lg:hidden",

          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0",
        ].join(" ")}
      >
        {/* DÉCOR */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="
              absolute
              left-[-35%]
              top-[5%]
              h-[380px]
              w-[380px]
              rounded-full
              bg-[radial-gradient(circle,rgba(255,99,4,0.12)_0%,rgba(242,41,91,0.05)_42%,transparent_72%)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-20%]
              right-[-30%]
              h-[380px]
              w-[380px]
              rounded-full
              bg-[radial-gradient(circle,rgba(116,232,160,0.10)_0%,rgba(42,120,83,0.04)_42%,transparent_72%)]
              blur-3xl
            "
          />
        </div>

        <div className="container-hopla relative z-10 flex min-h-full flex-col py-8">
          {/* NAVIGATION */}
          <nav className="flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/10
                  py-5
                  text-white
                  transition-colors
                  duration-300
                "
              >
                <span
                  className="
                    text-[clamp(1.65rem,7vw,2.2rem)]
                    font-semibold
                    leading-none
                    tracking-[-0.04em]
                  "
                >
                  {item.label}
                </span>

                <span className="text-xs font-semibold tracking-[0.15em] text-white/25">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>

          {/* PÔLES */}
          <div className="mt-8 grid gap-3">
            <a
              href="https://alteractweb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                justify-between
                rounded-full
                border
                border-white/10
                px-5
                py-4
                text-sm
                font-semibold
                text-white/65
                transition-all
                duration-300
              "
            >
              <span>AlteractWeb</span>
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="https://strategaction.com"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                items-center
                justify-between
                rounded-full
                border
                border-white/10
                px-5
                py-4
                text-sm
                font-semibold
                text-white/65
                transition-all
                duration-300
              "
            >
              <span>Stratège Action</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* CTA */}
          <div className="mt-4 pb-8">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="
                group
                relative
                flex
                w-full
                items-center
                justify-between
                overflow-hidden
                rounded-full
                bg-gradient-to-r
                from-[#FF7A58]
                to-[#993578]
                px-5
                py-4
                text-sm
                font-semibold
                text-white
              "
            >
              <span className="relative z-10">
                Nous contacter
              </span>

              <span
                aria-hidden="true"
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}