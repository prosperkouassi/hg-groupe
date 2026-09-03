"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type LayoutType =
  | "full"
  | "half"
  | "large"
  | "portrait";

type ProjectImage = {
  id: number;
  projectId: number;
  imagePath: string;
  altText: string | null;
  caption: string | null;
  layoutType: LayoutType;
  displayOrder: number;
};

type ProjectGalleryProps = {
  projectId: number;
  projectTitle: string;
};

const layoutOptions = [
  {
    value: "full",
    label: "Pleine largeur",
  },
  {
    value: "large",
    label: "Grande",
  },
  {
    value: "half",
    label: "Demi-largeur",
  },
  {
    value: "portrait",
    label: "Portrait",
  },
] as const;

export default function ProjectGallery({
  projectId,
  projectTitle,
}: ProjectGalleryProps) {
  const [images, setImages] =
    useState<ProjectImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadImages =
    useCallback(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/admin/projects/${projectId}/images`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Impossible de charger la galerie."
          );
        }

        setImages(
          data.images ?? []
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger la galerie."
        );
      } finally {
        setLoading(false);
      }
    }, [projectId]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setError(
        "Choisissez une image JPG, PNG ou WebP."
      );

      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      setError(
        "L'image ne doit pas dépasser 8 Mo."
      );

      return;
    }

    setUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "altText",
        projectTitle
      );

      formData.append(
        "layoutType",
        "full"
      );

      const response = await fetch(
        `/api/admin/projects/${projectId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible d'ajouter l'image."
        );
      }

      setSuccess(
        "Image ajoutée à la galerie."
      );

      await loadImages();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible d'ajouter l'image."
      );
    } finally {
      setUploading(false);
    }
  }

  function updateLocalImage(
    imageId: number,
    changes: Partial<ProjectImage>
  ) {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId
          ? {
              ...image,
              ...changes,
            }
          : image
      )
    );
  }

  async function saveImage(
    image: ProjectImage
  ) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/images/${image.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            altText:
              image.altText ?? "",

            caption:
              image.caption ?? "",

            layoutType:
              image.layoutType,

            displayOrder:
              image.displayOrder,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible d'enregistrer l'image."
        );
      }

      setSuccess(
        "Réglages de l'image enregistrés."
      );

      await loadImages();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d'enregistrer l'image."
      );
    }
  }

  async function deleteImage(
    image: ProjectImage
  ) {
    const confirmed =
      window.confirm(
        "Supprimer cette image de la galerie ?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/images/${image.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible de supprimer l'image."
        );
      }

      setSuccess(
        "Image supprimée."
      );

      setImages((current) =>
        current.filter(
          (item) =>
            item.id !== image.id
        )
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer l'image."
      );
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#081426]/10 bg-white px-4 py-3 text-sm text-[#081426] outline-none transition-colors focus:border-[#081426]/30";

  const labelClass =
    "block text-xs font-semibold text-[#081426]/65";

  return (
    <section className="rounded-[24px] border border-[#081426]/8 bg-white p-6 md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
            Galerie du projet
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[#081426]">
            Images secondaires
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#081426]/45">
            Ces visuels seront utilisés
            pour construire la page
            détaillée du cas d&apos;étude.
          </p>
        </div>

        <label
          className={[
            "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#071529] px-5 text-xs font-semibold transition-all hover:bg-[#10213A]",
            uploading
              ? "pointer-events-none opacity-50"
              : "",
          ].join(" ")}
          style={{
            color: "#FFFFFF",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
            }}
          >
            {uploading
              ? "Envoi..."
              : "+ Ajouter une image"}
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-[18px] bg-[#F8F6F2] px-6 py-12 text-center text-sm text-[#081426]/40">
          Chargement de la galerie...
        </div>
      ) : images.length === 0 ? (
        <label className="mt-8 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#081426]/20 bg-[#F8F6F2] px-6 text-center transition-colors hover:border-[#081426]/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#081426]/35 shadow-sm">
            +
          </div>

          <p className="mt-4 text-sm font-semibold text-[#081426]">
            Ajouter la première image
          </p>

          <p className="mt-2 text-xs text-[#081426]/40">
            JPG, PNG ou WebP · 8 Mo
            maximum
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      ) : (
        <div className="mt-8 space-y-5">
          {images.map((image) => (
            <article
              key={image.id}
              className="grid gap-6 rounded-[20px] border border-[#081426]/8 bg-[#FAF9F6] p-5 lg:grid-cols-[260px_minmax(0,1fr)]"
            >
              <div>
                <div
                  className={[
                    "overflow-hidden rounded-[15px] bg-[#ECE9E3]",
                    image.layoutType ===
                    "portrait"
                      ? "aspect-[4/5]"
                      : "aspect-[16/10]",
                  ].join(" ")}
                >
                  <img
                    src={image.imagePath}
                    alt={
                      image.altText ??
                      ""
                    }
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="mt-3 break-all text-[10px] leading-4 text-[#081426]/30">
                  {image.imagePath}
                </p>
              </div>

              <div className="min-w-0">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Disposition
                    </label>

                    <select
                      value={
                        image.layoutType
                      }
                      onChange={(
                        event
                      ) =>
                        updateLocalImage(
                          image.id,
                          {
                            layoutType:
                              event
                                .target
                                .value as LayoutType,
                          }
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {layoutOptions.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Ordre
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        image.displayOrder
                      }
                      onChange={(
                        event
                      ) =>
                        updateLocalImage(
                          image.id,
                          {
                            displayOrder:
                              Math.max(
                                0,
                                Number(
                                  event
                                    .target
                                    .value
                                ) ||
                                  0
                              ),
                          }
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Texte alternatif
                  </label>

                  <input
                    type="text"
                    value={
                      image.altText ??
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateLocalImage(
                        image.id,
                        {
                          altText:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </div>

                <div className="mt-5">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Légende
                  </label>

                  <textarea
                    value={
                      image.caption ??
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateLocalImage(
                        image.id,
                        {
                          caption:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className="mt-2 min-h-[90px] w-full resize-y rounded-xl border border-[#081426]/10 bg-white px-4 py-3 text-sm leading-6 text-[#081426] outline-none focus:border-[#081426]/30"
                    placeholder="Facultatif"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      saveImage(
                        image
                      )
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#071529] px-5 text-xs font-semibold transition-colors hover:bg-[#10213A]"
                    style={{
                      color:
                        "#FFFFFF",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#FFFFFF",
                      }}
                    >
                      Enregistrer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteImage(
                        image
                      )
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}