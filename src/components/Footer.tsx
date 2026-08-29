import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050b16] text-white">
      {/* BACKGROUND HALOS */}

      <div className="pointer-events-none absolute inset-0">
        <div className="footer-halo footer-halo-digital absolute" />
        <div className="footer-halo footer-halo-strategy absolute" />
        <div className="footer-halo footer-halo-hopla absolute" />
      </div>

      <div className="container-hopla relative z-10">
        {/* MAIN FOOTER */}

        <div className="grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_1fr] lg:gap-12 lg:py-20">
          {/* BRAND */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Retour à l'accueil"
            >
              <div className="h-11 w-11 flex-shrink-0">
                <img
                  src="/images/logo-hg-animated.svg"
                  alt="Logo Hopla Groupe"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex h-8 items-center">
                <img
                  src="/images/hopla-groupe.png"
                  alt="Hopla Groupe"
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
              Deux expertises complémentaires pour accompagner
              les entreprises dans leur développement, leur
              transformation digitale et la structuration de
              leur organisation.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-[#FF7A58] to-[#993578]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                Digital · Organisation · Développement
              </span>
            </div>
          </div>

          {/* NAVIGATION */}

          <div>
            <p className="footer-title">
              Navigation
            </p>

            <nav className="mt-6 flex flex-col gap-4">
              <Link
                href="/"
                className="footer-link"
              >
                Accueil
              </Link>

              <Link
                href="/expertises"
                className="footer-link"
              >
                Expertises
              </Link>

              <Link
                href="/cas-etudes"
                className="footer-link"
              >
                Cas d’études
              </Link>

              <Link
                href="/a-propos"
                className="footer-link"
              >
                À propos
              </Link>

              <Link
                href="/contact"
                className="footer-link"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* POLES */}

          <div>
            <p className="footer-title">
              Nos pôles
            </p>

            <div className="mt-6 space-y-7">
              {/* ALTERACTWEB */}

              <a
                href="https://alteractweb.com"
                target="_blank"
                rel="noreferrer"
                className="footer-pole group block"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      AlteractWeb
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Digital & Technologie
                    </p>
                  </div>

                  <span className="footer-arrow">
                    ↗
                  </span>
                </div>

                <div className="mt-4 h-px overflow-hidden bg-white/10">
                  <div className="footer-line footer-line-digital" />
                </div>
              </a>

              {/* STRATEGE ACTION */}

              <a
                href="https://strategaction.com"
                target="_blank"
                rel="noreferrer"
                className="footer-pole group block"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Stratège Action
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Organisation & Développement
                    </p>
                  </div>

                  <span className="footer-arrow">
                    ↗
                  </span>
                </div>

                <div className="mt-4 h-px overflow-hidden bg-white/10">
                  <div className="footer-line footer-line-strategy" />
                </div>
              </a>
            </div>
          </div>

          {/* CONTACT */}

          <div>
            <p className="footer-title">
              Contact
            </p>

            <div className="mt-6 space-y-4 text-sm text-white/50">
              <p>
                Côte d’Ivoire
              </p>

              <p>
                Abidjan · Grand-Bassam
              </p>

              <Link
                href="/contact"
                className="footer-contact-link"
              >
                Parler de votre projet
                <span>
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="flex flex-col gap-5 border-t border-white/10 py-6 text-[11px] text-white/30 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Hopla Groupe. Tous droits réservés.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/mentions-legales"
              className="transition-colors hover:text-white/60"
            >
              Mentions légales
            </Link>

            <Link
              href="/politique-confidentialite"
              className="transition-colors hover:text-white/60"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}