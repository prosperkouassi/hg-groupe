"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

type SiteChromeProps = {
  children: React.ReactNode;
};

export default function SiteChrome({
  children,
}: SiteChromeProps) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isContactRequestRoute =
    pathname === "/contact/demande" ||
    pathname.startsWith("/contact/demande/");

  const hideSiteChrome =
    isAdminRoute ||
    isContactRequestRoute;

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}