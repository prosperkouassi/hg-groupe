import Link from "next/link";

const digitalExpertises = [
  {
    number: "01",
    title: "Site web",
    description:
      "Concevoir une présence digitale cohérente avec votre identité, vos objectifs et les attentes de vos utilisateurs.",
    href: "/expertises/site-web",
  },
  {
    number: "02",
    title: "E-commerce",
    description:
      "Créer des expériences de vente fluides, performantes et adaptées à votre activité comme à vos parcours clients.",
    href: "/expertises/e-commerce",
  },
  {
    number: "03",
    title: "SaaS",
    description:
      "Transformer un besoin métier en solution digitale structurée, intuitive et capable d’évoluer avec votre organisation.",
    href: "/expertises/saas",
  },
  {
    number: "04",
    title: "Digitalisation",
    description:
      "Simplifier les processus, connecter les outils et automatiser les usages pour rendre votre organisation plus efficace.",
    href: "/expertises/digitalisation",
  },
];

const organisationExpertises = [
  {
    number: "01",
    title: "Organisation",
    description:
      "Structurer les rôles, les responsabilités et les modes de fonctionnement pour accompagner durablement l’évolution de l’organisation.",
    href: "/expertises/organisation",
  },
  {
    number: "02",
    title: "Ressources humaines",
    description:
      "Construire des pratiques RH cohérentes avec les besoins humains, opérationnels et stratégiques de l’entreprise.",
    href: "/expertises/ressources-humaines",
  },
  {
    number: "03",
    title: "Gestion de projet",
    description:
      "Transformer une intention en projet structuré et accompagner sa mise en œuvre jusqu’à l’obtention de résultats concrets.",
    href: "/expertises/gestion-de-projet",
  },
];

export default function ExpertisesShowcase() {
  return (
    <section className="bg-[#F6F3EE] text-[#081426]">
      {/* INTRODUCTION */}

      <div className="mx-auto max-w-[1440px] px-6 pb-28 pt-20 md:px-10 md:pb-36 md:pt-28 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#081426]/45">
              Nos expertises
            </p>
          </div>

          <div className="lg:col-span-8">
            <h2 className="font-display max-w-[900px] text-[clamp(2.25rem,4.2vw,4.5rem)] font-medium leading-[1] tracking-[-0.035em]">
              Deux expertises.
              <br />
              Une même ambition :
              <br />
              faire avancer vos projets.
            </h2>

            <p className="mt-8 max-w-[760px] text-[16px] leading-7 text-[#081426]/65 md:text-[18px] md:leading-8">
              Hopla Groupe réunit expertise digitale, organisation et
              accompagnement opérationnel pour transformer des besoins
              concrets en solutions utiles, cohérentes et durables.
            </p>
          </div>
        </div>
      </div>

      {/* SOLUTIONS DIGITALES */}

      <div className="border-t border-[#081426]/10">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32 lg:px-14">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-[12px] font-semibold tracking-[0.16em] text-[#FF6304]">
                  01
                </span>

                <h2 className="font-display mt-5 max-w-[360px] text-[clamp(2.35rem,3.3vw,3.8rem)] font-medium leading-[1] tracking-[-0.035em]">
                  Solutions
                  <br />
                  digitales
                </h2>

                <p className="mt-6 max-w-[370px] text-[15px] leading-7 text-[#081426]/60 md:text-[16px]">
                  Nous concevons des solutions digitales pensées pour répondre
                  à des usages réels, soutenir l’activité et accompagner son
                  évolution.
                </p>

                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A58] to-[#993578] px-6 py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(153,53,120,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(153,53,120,0.24)]"
                >
                  Parlons de votre projet
                </Link>

                <div className="mt-10 h-px w-full max-w-[250px] bg-gradient-to-r from-[#FF6304] to-[#F2295B]" />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-[#081426]/12">
                {digitalExpertises.map((expertise) => (
                  <Link
                    key={expertise.title}
                    href={expertise.href}
                    className="group grid gap-5 border-b border-[#081426]/12 py-8 transition-opacity duration-300 hover:opacity-70 md:grid-cols-[70px_1fr_1fr] md:items-start md:gap-6 md:py-10"
                  >
                    <span className="text-[11px] font-medium text-[#081426]/35">
                      {expertise.number}
                    </span>

                    <h3 className="text-[25px] font-semibold leading-tight tracking-[-0.04em] md:text-[32px]">
                      {expertise.title}
                    </h3>

                    <p className="max-w-[420px] text-[14px] leading-6 text-[#081426]/55 md:text-[15px] md:leading-7">
                      {expertise.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORGANISATION & DÉVELOPPEMENT */}

      <div className="bg-[#081426] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32 lg:px-14">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className="text-[12px] font-semibold tracking-[0.16em] text-[#74E8A0]">
                  02
                </span>

                <h2 className="font-display mt-5 max-w-[380px] text-[clamp(2.35rem,3.3vw,3.8rem)] font-medium leading-[1] tracking-[-0.035em]">
                  Organisation
                  <br />
                  & Développement
                </h2>

                <p className="mt-6 max-w-[390px] text-[15px] leading-7 text-white/58 md:text-[16px]">
                  Nous intervenons sur les organisations, les ressources et les
                  projets pour construire des fonctionnements adaptés aux
                  ambitions de l’entreprise.
                </p>

                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A58] to-[#993578] px-6 py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(153,53,120,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(153,53,120,0.28)]"
                >
                  Parlons de votre projet
                </Link>

                <div className="mt-10 h-px w-full max-w-[250px] bg-gradient-to-r from-[#2A7853] to-[#74E8A0]" />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-white/12">
                {organisationExpertises.map((expertise) => (
                  <Link
                    key={expertise.title}
                    href={expertise.href}
                    className="group grid gap-5 border-b border-white/12 py-8 transition-opacity duration-300 hover:opacity-70 md:grid-cols-[70px_1fr_1fr] md:items-start md:gap-6 md:py-10"
                  >
                    <span className="text-[11px] font-medium text-white/30">
                      {expertise.number}
                    </span>

                    <h3 className="text-[25px] font-semibold leading-tight tracking-[-0.04em] md:text-[32px]">
                      {expertise.title}
                    </h3>

                    <p className="max-w-[420px] text-[14px] leading-6 text-white/50 md:text-[15px] md:leading-7">
                      {expertise.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTHODE */}

      <div className="bg-[#F6F3EE]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#081426]/45">
                Notre manière de travailler
              </p>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-display max-w-[850px] text-[clamp(2.2rem,3.6vw,4rem)] font-medium leading-[1] tracking-[-0.035em]">
                Partir du besoin.
                <br />
                Construire la bonne réponse.
              </h2>

              <p className="mt-6 max-w-[750px] text-[16px] leading-7 text-[#081426]/62 md:text-[18px] md:leading-8">
                Nous ne partons pas d’une solution préconçue. Nous cherchons
                d’abord à comprendre l’environnement, les contraintes et les
                objectifs du projet afin de construire une réponse adaptée à
                sa réalité.
              </p>

              <div className="mt-14 grid gap-px overflow-hidden border border-[#081426]/10 bg-[#081426]/10 md:grid-cols-2">
                {[
                  {
                    number: "01",
                    title: "Analyser",
                    text: "Comprendre l’environnement, les besoins, les usages et les contraintes.",
                  },
                  {
                    number: "02",
                    title: "Orienter",
                    text: "Identifier les options pertinentes et définir la trajectoire à suivre.",
                  },
                  {
                    number: "03",
                    title: "Construire",
                    text: "Transformer les orientations retenues en solutions concrètes et opérationnelles.",
                  },
                  {
                    number: "04",
                    title: "Accompagner",
                    text: "Piloter la mise en œuvre et ajuster la démarche jusqu’à l’atteinte des objectifs.",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="min-h-[260px] bg-[#F6F3EE] p-7 md:p-9"
                  >
                    <span className="text-[11px] font-semibold text-[#081426]/35">
                      {item.number}
                    </span>

                    <h3 className="mt-10 text-[26px] font-semibold tracking-[-0.04em] md:text-[28px]">
                      {item.title}
                    </h3>

                    <p className="mt-6 max-w-[430px] text-[14px] leading-7 text-[#081426]/58">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}

      <div className="bg-[#050B16] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 md:py-32 lg:px-14">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Votre projet
              </p>

              <h2 className="font-display mt-6 max-w-[850px] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.04em]">
                Un projet
                <br />
                en tête ?
              </h2>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Link
                href="/contact"
                className="inline-flex items-center border-b border-white/30 pb-3 text-[16px] font-medium transition-colors duration-300 hover:border-white"
              >
                Parlons de votre projet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}