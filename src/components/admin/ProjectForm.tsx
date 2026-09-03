"use client";

import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import ProjectGallery from "@/components/admin/ProjectGallery";

import type {
  CaseCategory,
  CaseDomain,
} from "@/lib/cases";

type ProjectInitialData = {
  id: number;
  title: string;
  slug: string;

  domainId: number;
  categoryIds: number[];

  client: string | null;
  projectYear: number | null;

  introduction: string | null;
  context: string | null;
  mission: string | null;
  objectives: string | null;
  solution: string | null;
  results: string | null;

  externalUrl: string | null;

  coverImage: string | null;
  coverImageAlt: string | null;

  status: "draft" | "published";

  displayOrder: number;

  seoTitle: string | null;
  seoDescription: string | null;
};

type ProjectFormProps = {
  domains: CaseDomain[];
  categories: CaseCategory[];
  initialData?: ProjectInitialData;
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectForm({
  domains,
  categories,
  initialData,
}: ProjectFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(
    initialData?.title ?? ""
  );

  const [slug, setSlug] = useState(
    initialData?.slug ?? ""
  );

  const [slugModified, setSlugModified] =
    useState(Boolean(initialData));

  const [domainId, setDomainId] = useState(
    initialData
      ? String(initialData.domainId)
      : ""
  );

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<number[]>(
    initialData?.categoryIds ?? []
  );

  const [client, setClient] = useState(
    initialData?.client ?? ""
  );

  const [projectYear, setProjectYear] =
    useState(
      initialData?.projectYear
        ? String(initialData.projectYear)
        : String(new Date().getFullYear())
    );

  const [introduction, setIntroduction] =
    useState(
      initialData?.introduction ?? ""
    );

  const [context, setContext] = useState(
    initialData?.context ?? ""
  );

  const [mission, setMission] = useState(
    initialData?.mission ?? ""
  );

  const [objectives, setObjectives] =
    useState(
      initialData?.objectives ?? ""
    );

  const [solution, setSolution] = useState(
    initialData?.solution ?? ""
  );

  const [results, setResults] = useState(
    initialData?.results ?? ""
  );

  const [externalUrl, setExternalUrl] =
    useState(
      initialData?.externalUrl ?? ""
    );

  const [coverImage, setCoverImage] =
    useState(
      initialData?.coverImage ?? ""
    );

  const [coverImageAlt, setCoverImageAlt] =
    useState(
      initialData?.coverImageAlt ?? ""
    );

  const [imageUploading, setImageUploading] =
    useState(false);

  const [imageError, setImageError] =
    useState("");

  const [status, setStatus] = useState<
    "draft" | "published"
  >(initialData?.status ?? "draft");

  const [displayOrder, setDisplayOrder] =
    useState(
      String(initialData?.displayOrder ?? 0)
    );

  const [seoTitle, setSeoTitle] = useState(
    initialData?.seoTitle ?? ""
  );

  const [
    seoDescription,
    setSeoDescription,
  ] = useState(
    initialData?.seoDescription ?? ""
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const availableCategories =
    useMemo(() => {
      if (!domainId) {
        return [];
      }

      return categories.filter(
        (category) =>
          category.domain_id ===
          Number(domainId)
      );
    }, [categories, domainId]);

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (!slugModified) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(
    value: string
  ) {
    setSlugModified(true);
    setSlug(createSlug(value));
  }

  function handleDomainChange(
    value: string
  ) {
    setDomainId(value);
    setSelectedCategories([]);
  }

  function toggleCategory(
    categoryId: number
  ) {
    setSelectedCategories(
      (current) => {
        if (
          current.includes(categoryId)
        ) {
          return current.filter(
            (id) => id !== categoryId
          );
        }

        return [
          ...current,
          categoryId,
        ];
      }
    );
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setImageError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setImageError(
        "Choisissez une image JPG, PNG ou WebP."
      );

      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      setImageError(
        "L'image ne doit pas dépasser 8 Mo."
      );

      return;
    }

    setImageUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response = await fetch(
        "/api/admin/uploads/case-cover",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setImageError(
          data.message ||
            "Impossible d'envoyer l'image."
        );

        return;
      }

      setCoverImage(data.path);

      if (!coverImageAlt.trim()) {
        setCoverImageAlt(title);
      }
    } catch {
      setImageError(
        "Une erreur est survenue pendant l'envoi de l'image."
      );
    } finally {
      setImageUploading(false);
    }
  }

  function removeCoverImage() {
    setCoverImage("");
    setImageError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      loading ||
      imageUploading
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isEditing
        ? `/api/admin/projects/${initialData!.id}`
        : "/api/admin/projects";

      const response = await fetch(
        endpoint,
        {
          method: isEditing
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            slug,

            domainId:
              Number(domainId),

            categoryIds:
              selectedCategories,

            client,

            projectYear:
              projectYear
                ? Number(projectYear)
                : null,

            introduction,
            context,
            mission,
            objectives,
            solution,
            results,

            externalUrl,

            coverImage,
            coverImageAlt,

            status,

            displayOrder:
              Number(displayOrder) ||
              0,

            seoTitle,
            seoDescription,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Impossible d'enregistrer le projet."
        );

        setLoading(false);

        return;
      }

      router.push(
        "/admin/projets"
      );

      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue pendant l'enregistrement."
      );

      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#081426]/10 bg-white px-4 py-3 text-sm text-[#081426] outline-none transition-colors focus:border-[#081426]/30";

  const textareaClass =
    "mt-2 min-h-[150px] w-full resize-y rounded-xl border border-[#081426]/10 bg-white px-4 py-3 text-sm leading-6 text-[#081426] outline-none transition-colors focus:border-[#081426]/30";

  const labelClass =
    "block text-xs font-semibold text-[#081426]/65";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="space-y-8">

        {/* INFORMATIONS PRINCIPALES */}

        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Informations principales
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="title"
                className={labelClass}
              >
                Titre du projet *
              </label>

              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className={labelClass}
              >
                Slug *
              </label>

              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(event) =>
                  handleSlugChange(
                    event.target.value
                  )
                }
                className={inputClass}
              />

              <p className="mt-2 text-xs text-[#081426]/35">
                /cas-etudes/
                {slug || "nom-du-projet"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="client"
                  className={labelClass}
                >
                  Client
                </label>

                <input
                  id="client"
                  type="text"
                  value={client}
                  onChange={(event) =>
                    setClient(
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="projectYear"
                  className={labelClass}
                >
                  Année
                </label>

                <input
                  id="projectYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={projectYear}
                  onChange={(event) =>
                    setProjectYear(
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CLASSEMENT */}

        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Classement
          </p>

          <div className="mt-7">
            <label
              htmlFor="domain"
              className={labelClass}
            >
              Domaine *
            </label>

            <select
              id="domain"
              required
              value={domainId}
              onChange={(event) =>
                handleDomainChange(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Sélectionner un domaine
              </option>

              {domains.map((domain) => (
                <option
                  key={domain.id}
                  value={domain.id}
                >
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          {domainId && (
            <div className="mt-7">
              <p className={labelClass}>
                Catégories
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {availableCategories.map(
                  (category) => {
                    const active =
                      selectedCategories.includes(
                        category.id
                      );

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          toggleCategory(
                            category.id
                          )
                        }
                        className={[
                          "rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                          active
                            ? "border-[#081426] bg-[#081426] text-white"
                            : "border-[#081426]/10 bg-white text-[#081426]/55 hover:border-[#081426]/25",
                        ].join(" ")}
                        style={
                          active
                            ? {
                                color:
                                  "#FFFFFF",
                              }
                            : undefined
                        }
                      >
                        {category.name}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>

        {/* PRÉSENTATION */}

        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Présentation
          </p>

          <div className="mt-7 space-y-7">
            <div>
              <label
                htmlFor="introduction"
                className={labelClass}
              >
                Introduction
              </label>

              <textarea
                id="introduction"
                value={introduction}
                onChange={(event) =>
                  setIntroduction(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="context"
                className={labelClass}
              >
                Contexte
              </label>

              <textarea
                id="context"
                value={context}
                onChange={(event) =>
                  setContext(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="mission"
                className={labelClass}
              >
                Mission
              </label>

              <textarea
                id="mission"
                value={mission}
                onChange={(event) =>
                  setMission(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="objectives"
                className={labelClass}
              >
                Objectifs
              </label>

              <textarea
                id="objectives"
                value={objectives}
                onChange={(event) =>
                  setObjectives(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="solution"
                className={labelClass}
              >
                Solution / accompagnement
              </label>

              <textarea
                id="solution"
                value={solution}
                onChange={(event) =>
                  setSolution(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>

            <div>
              <label
                htmlFor="results"
                className={labelClass}
              >
                Résultats
              </label>

              <textarea
                id="results"
                value={results}
                onChange={(event) =>
                  setResults(
                    event.target.value
                  )
                }
                className={textareaClass}
              />
            </div>
          </div>
        </section>

        {/* IMAGE PRINCIPALE */}

        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
              Image principale
            </p>

            <p className="mt-2 text-sm leading-6 text-[#081426]/45">
              Cette image sera utilisée comme
              visuel principal du cas d&apos;étude
              et comme vignette dans l&apos;archive.
            </p>
          </div>

          <div className="mt-7">
            {coverImage ? (
              <div className="overflow-hidden rounded-[20px] border border-[#081426]/10 bg-[#F6F3EE]">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#ECE9E3]">
                  <img
                    src={coverImage}
                    alt={
                      coverImageAlt ||
                      title ||
                      "Image principale"
                    }
                    className="h-full w-full object-cover"
                  />

                  {imageUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#081426]/60 backdrop-blur-sm">
                      <div className="rounded-full bg-white px-5 py-3 text-xs font-semibold text-[#081426]">
                        Envoi de l&apos;image...
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#081426]">
                      Image principale
                    </p>

                    <p className="mt-1 truncate text-[11px] text-[#081426]/35">
                      {coverImage}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <label
                      className={[
                        "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[#081426]/15 bg-white px-4 text-xs font-semibold text-[#081426] transition-colors hover:border-[#081426]/30",
                        imageUploading
                          ? "pointer-events-none opacity-50"
                          : "",
                      ].join(" ")}
                    >
                      Remplacer

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageUpload
                        }
                        disabled={
                          imageUploading
                        }
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={
                        removeCoverImage
                      }
                      disabled={
                        imageUploading
                      }
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className={[
                  "group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#081426]/20 bg-[#F8F6F2] px-6 text-center transition-all duration-300 hover:border-[#081426]/40 hover:bg-[#F4F1EC]",
                  imageUploading
                    ? "pointer-events-none opacity-60"
                    : "",
                ].join(" ")}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  {imageUploading ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6 animate-spin text-[#081426]"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        opacity="0.2"
                      />

                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6 text-[#081426]/50"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 16V5M8 9l4-4 4 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M5 14v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                <p className="mt-5 text-sm font-semibold text-[#081426]">
                  {imageUploading
                    ? "Envoi de l'image..."
                    : "Ajouter une image"}
                </p>

                {!imageUploading && (
                  <>
                    <p className="mt-2 max-w-sm text-xs leading-5 text-[#081426]/40">
                      Cliquez ici pour sélectionner
                      une image depuis votre ordinateur
                    </p>

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#081426]/25">
                      JPG · PNG · WEBP · 8 Mo max.
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageUpload
                  }
                  disabled={
                    imageUploading
                  }
                  className="hidden"
                />
              </label>
            )}

            {imageError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {imageError}
              </div>
            )}

            <div className="mt-6">
              <label
                htmlFor="coverImageAlt"
                className={labelClass}
              >
                Texte alternatif
              </label>

              <input
                id="coverImageAlt"
                type="text"
                value={coverImageAlt}
                onChange={(event) =>
                  setCoverImageAlt(
                    event.target.value
                  )
                }
                className={inputClass}
                placeholder="Décrivez brièvement l'image"
              />

              <p className="mt-2 text-[11px] leading-5 text-[#081426]/35">
                Utile pour l&apos;accessibilité
                et le référencement de
                l&apos;image.
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="externalUrl"
                className={labelClass}
              >
                URL du projet
              </label>

              <input
                id="externalUrl"
                type="url"
                value={externalUrl}
                onChange={(event) =>
                  setExternalUrl(
                    event.target.value
                  )
                }
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* GALERIE DU PROJET */}

        {initialData && (
          <ProjectGallery
            projectId={initialData.id}
            projectTitle={title}
          />
        )}

        {/* SEO */}

        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Référencement
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="seoTitle"
                className={labelClass}
              >
                Titre SEO
              </label>

              <input
                id="seoTitle"
                type="text"
                maxLength={255}
                value={seoTitle}
                onChange={(event) =>
                  setSeoTitle(
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="seoDescription"
                className={labelClass}
              >
                Meta description
              </label>

              <textarea
                id="seoDescription"
                maxLength={320}
                value={seoDescription}
                onChange={(event) =>
                  setSeoDescription(
                    event.target.value
                  )
                }
                className={`${textareaClass} min-h-[110px]`}
              />

              <p className="mt-2 text-right text-[11px] text-[#081426]/30">
                {seoDescription.length}/320
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* PUBLICATION */}

      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Publication
          </p>

          <div className="mt-6">
            <label
              htmlFor="status"
              className={labelClass}
            >
              Statut
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as
                    | "draft"
                    | "published"
                )
              }
              className={inputClass}
            >
              <option value="draft">
                Brouillon
              </option>

              <option value="published">
                Publié
              </option>
            </select>
          </div>

          <div className="mt-6">
            <label
              htmlFor="displayOrder"
              className={labelClass}
            >
              Ordre d&apos;affichage
            </label>

            <input
              id="displayOrder"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          {coverImage && (
            <div className="mt-6 overflow-hidden rounded-[15px] border border-[#081426]/8 bg-[#F6F3EE]">
              <div className="aspect-[16/9]">
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#081426]/35">
                  Image prête
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              imageUploading
            }
            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-full bg-[#071529] px-5 text-sm font-semibold transition-all duration-300 hover:bg-[#10213A] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color: "#FFFFFF",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
              }}
            >
              {imageUploading
                ? "Image en cours d'envoi..."
                : loading
                  ? "Enregistrement..."
                  : isEditing
                    ? "Enregistrer les modifications"
                    : status ===
                        "published"
                      ? "Publier le projet"
                      : "Enregistrer le brouillon"}
            </span>
          </button>
        </section>
      </aside>
    </form>
  );
}