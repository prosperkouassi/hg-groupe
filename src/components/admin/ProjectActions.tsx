"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type ProjectActionsProps = {
  projectId: number;
  projectTitle: string;
  projectSlug: string;
  status: "draft" | "published";
};

export default function ProjectActions({
  projectId,
  projectTitle,
  projectSlug,
  status,
}: ProjectActionsProps) {
  const router = useRouter();

  const [isDuplicating, setIsDuplicating] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  /* =========================================================
     VERROUILLAGE DU SCROLL QUAND LA MODALE EST OUVERTE
  ========================================================= */

  useEffect(() => {
    if (!showDeleteConfirmation) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        if (!isDeleting) {
          setShowDeleteConfirmation(
            false
          );
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    showDeleteConfirmation,
    isDeleting,
  ]);

  /* =========================================================
     LECTURE SÉCURISÉE DES RÉPONSES API
  ========================================================= */

  async function readApiResponse(
    response: Response
  ) {
    const text =
      await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        error: text,
      };
    }
  }

  /* =========================================================
     DUPLICATION
  ========================================================= */

  async function handleDuplicate() {
    if (
      isDuplicating ||
      isDeleting
    ) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsDuplicating(true);

      const response = await fetch(
        `/api/admin/projects/${projectId}/duplicate`,
        {
          method: "POST",
        }
      );

      const data =
        await readApiResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Impossible de dupliquer le projet."
        );
      }

      if (!data?.projectId) {
        throw new Error(
          "Le projet a été dupliqué mais son identifiant n’a pas été retourné."
        );
      }

      router.push(
        `/admin/projets/${data.projectId}/modifier`
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setIsDuplicating(false);
    }
  }

  /* =========================================================
     OUVERTURE CONFIRMATION SUPPRESSION
  ========================================================= */

  function openDeleteConfirmation() {
    if (
      isDeleting ||
      isDuplicating
    ) {
      return;
    }

    setErrorMessage(null);

    setShowDeleteConfirmation(
      true
    );
  }

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  async function handleDelete() {
    if (
      isDeleting ||
      isDuplicating
    ) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsDeleting(true);

      const response = await fetch(
        `/api/admin/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await readApiResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Impossible de supprimer le projet (${response.status}).`
        );
      }

      setShowDeleteConfirmation(
        false
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la suppression."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {status === "published" && (
          <Link
            href={`/cas-etudes/${projectSlug}`}
            target="_blank"
            title="Voir le projet"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#081426]/10 bg-white text-sm transition-all duration-300 hover:border-[#081426]/25"
            style={{
              color: "#081426",
            }}
          >
            ↗
          </Link>
        )}

        <Link
          href={`/admin/projets/${projectId}/modifier`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#071529] px-5 text-xs font-semibold transition-all duration-300 hover:scale-[1.02] hover:bg-[#10213A]"
          style={{
            color: "#FFFFFF",
          }}
        >
          Modifier
        </Link>

        <button
          type="button"
          onClick={handleDuplicate}
          disabled={
            isDuplicating ||
            isDeleting
          }
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#081426]/12 bg-white px-5 text-xs font-semibold transition-all duration-300 hover:border-[#081426]/30 hover:bg-[#081426]/[0.025] disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            color: "#081426",
          }}
        >
          {isDuplicating
            ? "Duplication..."
            : "Dupliquer"}
        </button>

        <button
          type="button"
          onClick={
            openDeleteConfirmation
          }
          disabled={
            isDeleting ||
            isDuplicating
          }
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#B43C3C]/15 bg-[#B43C3C]/[0.045] px-5 text-xs font-semibold transition-all duration-300 hover:border-[#B43C3C]/30 hover:bg-[#B43C3C]/10 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            color: "#A12F2F",
          }}
        >
          Supprimer
        </button>
      </div>

      {/* =====================================================
          MESSAGE D'ERREUR GÉNÉRAL
      ====================================================== */}

      {errorMessage &&
        !showDeleteConfirmation && (
          <div
            role="alert"
            className="fixed bottom-6 right-6 z-[100] max-w-[380px] rounded-[16px] border border-[#B43C3C]/15 bg-white px-5 py-4 shadow-[0_20px_60px_rgba(8,20,38,0.15)]"
          >
            <p className="text-sm font-semibold text-[#A12F2F]">
              Une erreur est survenue
            </p>

            <p className="mt-2 text-xs leading-5 text-[#081426]/55">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(null)
              }
              className="mt-3 text-xs font-semibold text-[#081426]"
            >
              Fermer
            </button>
          </div>
        )}

      {/* =====================================================
          POPUP DE CONFIRMATION
      ====================================================== */}

      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-project-title-${projectId}`}
        >
          {/* FOND */}

          <button
            type="button"
            aria-label="Fermer la confirmation"
            disabled={isDeleting}
            onClick={() =>
              setShowDeleteConfirmation(
                false
              )
            }
            className="absolute inset-0 cursor-default bg-[#050B16]/55 backdrop-blur-[3px]"
          />

          {/* MODALE */}

          <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] bg-[#F7F4EF] shadow-[0_30px_100px_rgba(5,11,22,0.3)]">
            <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-9">
              {/* ICÔNE */}

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B43C3C]/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                  style={{
                    color: "#A12F2F",
                  }}
                >
                  <path
                    d="M4 7h16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M9 7V4.8C9 4.36 9.36 4 9.8 4h4.4c.44 0 .8.36.8.8V7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M7 7l.75 11.2c.05.78.7 1.4 1.5 1.4h5.5c.8 0 1.45-.62 1.5-1.4L17 7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10 10v6M14 10v6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* TEXTE */}

              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A12F2F]/70">
                Suppression définitive
              </p>

              <h2
                id={`delete-project-title-${projectId}`}
                className="mt-3 text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#081426]"
              >
                Supprimer ce projet ?
              </h2>

              <p className="mt-6 text-sm leading-6 text-[#081426]/55">
                Vous êtes sur le point de
                supprimer définitivement{" "}
                <strong className="font-semibold text-[#081426]">
                  {projectTitle}
                </strong>
                .
              </p>

              <p className="mt-3 text-sm leading-6 text-[#081426]/55">
                Cette action est
                irréversible.
              </p>

              {/* ERREUR */}

              {errorMessage && (
                <div className="mt-6 rounded-[14px] border border-[#B43C3C]/15 bg-[#B43C3C]/[0.05] px-4 py-3">
                  <p className="text-xs leading-5 text-[#A12F2F]">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* BOUTONS */}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    setShowDeleteConfirmation(
                      false
                    )
                  }
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#081426]/10 bg-white px-6 text-sm font-semibold transition-all duration-300 hover:border-[#081426]/25 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    color: "#081426",
                  }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex min-h-12 min-w-[190px] items-center justify-center rounded-full bg-[#A12F2F] px-6 text-sm font-semibold transition-all duration-300 hover:bg-[#8D2929] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  {isDeleting
                    ? "Suppression..."
                    : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}