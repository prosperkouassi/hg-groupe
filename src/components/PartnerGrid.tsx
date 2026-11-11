
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { Partner } from '@/lib/partner-types';
import { partnerColumns } from '@/lib/partner-types';

import styles from './PartnerGrid.module.css';

export default function PartnerGrid({
  partners,
}: {
  partners: Partner[];
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;

    if (!section) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>('[data-partner-card]')
    );

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target as HTMLElement;

          card.classList.add(styles.reveal);

          observer.unobserve(card);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [partners]);

  return (
    <section
      ref={root}
      className={styles.section}
      aria-labelledby="partners-title"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            Nos références
          </p>

          <h2 id="partners-title">
            Ils nous font confiance
          </h2>

          <p>
            Des projets, des rencontres et des ambitions partagées
          </p>
        </header>

        <div
          className={styles.grid}
          style={
            {
              '--columns': partnerColumns(partners.length),
            } as CSSProperties
          }
        >
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              data-partner-card
              className={styles.card}
              style={
                {
                  animationDelay: `${Math.min(index % 5, 4) * 0.09}s`,
                }
              }
            >
              {partner.website_url ? (
                <a
                  className={styles.logo}
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${partner.name} (nouvel onglet)`}
                >
                  <Image
                    src={partner.logo_path}
                    alt={partner.name}
                    width={220}
                    height={120}
                    unoptimized
                  />
                </a>
              ) : (
                <div className={styles.logo}>
                  <Image
                    src={partner.logo_path}
                    alt={partner.name}
                    width={220}
                    height={120}
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}

          <Link
            href="/contact"
            data-partner-card
            className={`${styles.card} ${styles.cta}`}
            style={{
              animationDelay: `${Math.min(partners.length % 5, 4) * 0.09}s`,
            }}
          >
            <span
              className={styles.plus}
              aria-hidden="true"
            >
              +
            </span>

            <h3>Votre logo ici ?</h3>

            <p>
              Et si nous faisions avancer votre projet ensemble ?
            </p>

            <span className={styles.action}>
              Parlons de votre projet
              <span aria-hidden="true"> ↗</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
