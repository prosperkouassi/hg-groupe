"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./recruitment.module.css";

export default function OfferList({ children, selectedSlug }: {
  children: ReactNode;
  selectedSlug?: string;
}) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = list.current;
    const active = container?.querySelector('[aria-current="page"]');
    if (!container || !active || !container.clientHeight) return;

    const viewport = container.getBoundingClientRect();
    const card = active.getBoundingClientRect();
    if (card.top < viewport.top || card.bottom > viewport.bottom) {
      container.scrollTop += card.top - viewport.top - 14;
    }
  }, [selectedSlug]);

  return <ul ref={list} className={styles.cards} aria-label="Offres d’emploi">{children}</ul>;
}
