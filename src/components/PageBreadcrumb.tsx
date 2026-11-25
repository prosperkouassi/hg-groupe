import Link from "next/link";
import styles from "./PageBreadcrumb.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  items: BreadcrumbItem[];
  atPageStart?: boolean;
};

export default function PageBreadcrumb({
  items,
  atPageStart = false,
}: PageBreadcrumbProps) {
  return (
    <div className={`page-breadcrumb ${styles.sticky}${atPageStart ? ` ${styles.start}` : ""}`}>
      <div className="container-hopla">
        <nav
          aria-label="Fil d’Ariane"
          className="page-breadcrumb-nav"
        >
          <Link
            href="/"
            className="page-breadcrumb-link"
          >
            Accueil
          </Link>

          {items.map((item) => (
            <span
              key={`${item.label}-${item.href ?? "current"}`}
              className="contents"
            >
              <span className="page-breadcrumb-separator">
                /
              </span>

              {item.href ? (
                <Link
                  href={item.href}
                  className="page-breadcrumb-link"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="page-breadcrumb-current">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}