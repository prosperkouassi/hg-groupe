"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";

import styles from "@/app/contact/contact.module.css";

type ServiceChoice =
  | "rh"
  | "digital"
  | "expert"
  | "";

type ContactFormValues = {
  email: string;
  privacyAccepted: boolean;

  firstName: string;
  lastName: string;
  company: string;
  role: string;
  phone: string;
  country: string;

  service: ServiceChoice;

  projectTitle: string;
  description: string;
  deadline: string;
  budget: string;
};

const initialFormData: ContactFormValues = {
  email: "",
  privacyAccepted: false,

  firstName: "",
  lastName: "",
  company: "",
  role: "",
  phone: "",
  country: "",

  service: "",

  projectTitle: "",
  description: "",
  deadline: "",
  budget: "",
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export default function ContactProjectForm() {
  const [step, setStep] =
    useState(1);

  const [formData, setFormData] =
    useState<ContactFormValues>(
      initialFormData,
    );

  const [
    attachment,
    setAttachment,
  ] =
    useState<File | null>(null);

  /*
   * Champ anti-spam invisible.
   *
   * Un utilisateur normal ne peut
   * pas le voir ni le remplir.
   */
  const [
    website,
    setWebsite,
  ] =
    useState("");

  /*
   * Moment où le formulaire
   * a été chargé.
   *
   * Le serveur rejettera une
   * soumission artificiellement
   * instantanée.
   */
  const [formStartedAt] =
    useState(() =>
      Date.now(),
    );

  const [submitted, setSubmitted] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  const [errors, setErrors] =
    useState<
      Record<string, string>
    >({});

  const progress =
    useMemo(
      () => `${step} / 04`,
      [step],
    );

  const updateField =
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLSelectElement>,
    ) => {
      const { name, value } =
        event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );

      setErrors(
        (current) => ({
          ...current,
          [name]: "",
        }),
      );

      setSubmitError("");
    };

  const handleAttachmentChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ??
      null;

    setSubmitError("");

    if (!file) {
      setAttachment(null);

      setErrors(
        (current) => ({
          ...current,
          attachment: "",
        }),
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setAttachment(null);

      event.target.value =
        "";

      setErrors(
        (current) => ({
          ...current,
          attachment:
            "La pièce jointe ne doit pas dépasser 5 Mo.",
        }),
      );

      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type,
      )
    ) {
      setAttachment(null);

      event.target.value =
        "";

      setErrors(
        (current) => ({
          ...current,
          attachment:
            "Formats autorisés : PDF, Word, JPG et PNG.",
        }),
      );

      return;
    }

    setAttachment(file);

    setErrors(
      (current) => ({
        ...current,
        attachment: "",
      }),
    );
  };

  const validateStep = () => {
    const nextErrors:
      Record<string, string> = {};

    if (step === 1) {
      if (
        !formData.email.trim()
      ) {
        nextErrors.email =
          "Veuillez renseigner votre adresse e-mail.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email,
        )
      ) {
        nextErrors.email =
          "Veuillez renseigner une adresse e-mail valide.";
      }

      if (
        !formData.privacyAccepted
      ) {
        nextErrors.privacyAccepted =
          "Votre accord est nécessaire pour poursuivre.";
      }
    }

    if (step === 2) {
      if (
        !formData.firstName.trim()
      ) {
        nextErrors.firstName =
          "Veuillez renseigner votre prénom.";
      }

      if (
        !formData.lastName.trim()
      ) {
        nextErrors.lastName =
          "Veuillez renseigner votre nom.";
      }

      if (
        !formData.phone.trim()
      ) {
        nextErrors.phone =
          "Veuillez renseigner votre numéro de téléphone.";
      }

      if (
        !formData.country.trim()
      ) {
        nextErrors.country =
          "Veuillez renseigner votre pays.";
      }
    }

    if (step === 3) {
      if (
        !formData.service
      ) {
        nextErrors.service =
          "Sélectionnez une option pour continuer.";
      }
    }

    if (step === 4) {
      if (
        !formData.projectTitle.trim()
      ) {
        nextErrors.projectTitle =
          "Veuillez donner un titre à votre demande.";
      }

      if (
        !formData.description.trim()
      ) {
        nextErrors.description =
          "Décrivez-nous brièvement votre besoin.";
      }

      if (
        attachment &&
        attachment.size >
          MAX_FILE_SIZE
      ) {
        nextErrors.attachment =
          "La pièce jointe ne doit pas dépasser 5 Mo.";
      }

      if (
        attachment &&
        !ALLOWED_FILE_TYPES.includes(
          attachment.type,
        )
      ) {
        nextErrors.attachment =
          "Formats autorisés : PDF, Word, JPG et PNG.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    setSubmitError("");

    setStep(
      (current) =>
        Math.min(
          current + 1,
          4,
        ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousStep = () => {
    setErrors({});
    setSubmitError("");

    setStep(
      (current) =>
        Math.max(
          current - 1,
          1,
        ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      isSubmitting ||
      !validateStep()
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload =
        new FormData();

      /*
       * Données anti-spam.
       */
      payload.append(
        "website",
        website,
      );

      payload.append(
        "formStartedAt",
        String(
          formStartedAt,
        ),
      );

      payload.append(
        "email",
        formData.email.trim(),
      );

      payload.append(
        "privacyAccepted",
        String(
          formData.privacyAccepted,
        ),
      );

      payload.append(
        "firstName",
        formData.firstName.trim(),
      );

      payload.append(
        "lastName",
        formData.lastName.trim(),
      );

      payload.append(
        "company",
        formData.company.trim(),
      );

      payload.append(
        "role",
        formData.role.trim(),
      );

      payload.append(
        "phone",
        formData.phone.trim(),
      );

      payload.append(
        "country",
        formData.country.trim(),
      );

      payload.append(
        "service",
        formData.service,
      );

      payload.append(
        "projectTitle",
        formData.projectTitle.trim(),
      );

      payload.append(
        "description",
        formData.description.trim(),
      );

      payload.append(
        "deadline",
        formData.deadline.trim(),
      );

      payload.append(
        "budget",
        formData.budget.trim(),
      );

      if (attachment) {
        payload.append(
          "attachment",
          attachment,
          attachment.name,
        );
      }

      const response =
        await fetch(
          "/api/contact",
          {
            method: "POST",
            body: payload,
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          message?: string;
        };

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Impossible d'envoyer votre demande pour le moment.",
        );
      }

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Erreur envoi formulaire :",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'envoi de votre demande.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectService = (
    service:
      ServiceChoice,
  ) => {
    setFormData(
      (current) => ({
        ...current,
        service,
      }),
    );

    setErrors(
      (current) => ({
        ...current,
        service: "",
      }),
    );

    setSubmitError("");
  };

  if (submitted) {
    return (
      <main
        className={
          styles.formPage
        }
      >
        <div
          aria-hidden="true"
          className={
            styles.formBackgroundImage
          }
        />

        <div
          aria-hidden="true"
          className={
            styles.formGrid
          }
        />

        <div
          aria-hidden="true"
          className={`${styles.formHalo} ${styles.formHaloDigital}`}
        />

        <div
          aria-hidden="true"
          className={`${styles.formHalo} ${styles.formHaloStrategy}`}
        />

        <div
          aria-hidden="true"
          className={`${styles.formOrbit} ${styles.formOrbitOne}`}
        />

        <div
          aria-hidden="true"
          className={`${styles.formOrbit} ${styles.formOrbitTwo}`}
        />

        <div
          className={
            styles.formShell
          }
        >
          <Link
            href="/contact"
            className={
              styles.formBackLink
            }
          >
            ← Retour au contact
          </Link>

          <div
            className={
              styles.successPanel
            }
          >
            <span
              className={
                styles.formEyebrow
              }
            >
              Demande transmise
            </span>

            <h1
              className={
                styles.successTitle
              }
            >
              Merci, votre demande est
              bien reçue.
            </h1>

            <p
              className={
                styles.successText
              }
            >
              Nous revenons vers vous
              rapidement pour échanger
              sur votre besoin.
            </p>

            <div
              className={
                styles.successActions
              }
            >
              <a
                href="https://wa.me/2250702311361"
                target="_blank"
                rel="noopener noreferrer"
                className={
                  styles.expertWhatsapp
                }
              >
                Expert RH & Organisation
              </a>

              <a
                href="https://wa.me/2250714074124"
                target="_blank"
                rel="noopener noreferrer"
                className={
                  styles.expertWhatsapp
                }
              >
                Expert Digital
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={
        styles.formPage
      }
    >
      <div
        aria-hidden="true"
        className={
          styles.formBackgroundImage
        }
      />

      <div
        aria-hidden="true"
        className={
          styles.formGrid
        }
      />

      <div
        aria-hidden="true"
        className={`${styles.formHalo} ${styles.formHaloDigital}`}
      />

      <div
        aria-hidden="true"
        className={`${styles.formHalo} ${styles.formHaloStrategy}`}
      />

      <div
        aria-hidden="true"
        className={`${styles.formOrbit} ${styles.formOrbitOne}`}
      />

      <div
        aria-hidden="true"
        className={`${styles.formOrbit} ${styles.formOrbitTwo}`}
      />

      <div
        className={
          styles.formShell
        }
      >
        <div
          className={
            styles.formTopbar
          }
        >
          <Link
            href="/contact"
            className={
              styles.formBackLink
            }
          >
            ← Retour au contact
          </Link>

          <span
            className={
              styles.formProgress
            }
          >
            {progress}
          </span>
        </div>

        <div
          className={
            styles.progressTrack
          }
        >
          <div
            className={
              styles.progressValue
            }
            style={{
              width:
                `${step * 25}%`,
            }}
          />
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className={
            styles.formContent
          }
          noValidate
        >
          {/*
           * Honeypot anti-spam.
           *
           * Il est volontairement
           * placé hors de l'écran
           * plutôt qu'en type="hidden"
           * afin que certains bots
           * automatisés le détectent
           * comme un champ classique.
           */}
          <div
            aria-hidden="true"
            style={{
              position:
                "absolute",
              width: "1px",
              height: "1px",
              overflow:
                "hidden",
              clip:
                "rect(0 0 0 0)",
              clipPath:
                "inset(50%)",
              whiteSpace:
                "nowrap",
            }}
          >
            <label
              htmlFor="website"
            >
              Site internet
            </label>

            <input
              id="website"
              name="website"
              type="text"
              value={website}
              onChange={(
                event,
              ) =>
                setWebsite(
                  event.target
                    .value,
                )
              }
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {step === 1 && (
            <section
              className={
                styles.formStep
              }
            >
              <span
                className={
                  styles.formEyebrow
                }
              >
                Première étape
              </span>

              <h1
                className={
                  styles.formTitle
                }
              >
                Commençons simplement.
              </h1>

              <p
                className={
                  styles.formDescription
                }
              >
                Renseignez votre adresse
                e-mail pour démarrer
                votre demande.
              </p>

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="email"
                  className={
                    styles.fieldLabel
                  }
                >
                  Adresse e-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={
                    formData.email
                  }
                  onChange={
                    updateField
                  }
                  placeholder="vous@entreprise.com"
                  className={
                    styles.fieldInput
                  }
                  aria-invalid={
                    Boolean(
                      errors.email,
                    )
                  }
                />

                {errors.email && (
                  <p
                    className={
                      styles.fieldError
                    }
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <label
                className={
                  styles.checkboxRow
                }
              >
                <input
                  type="checkbox"
                  checked={
                    formData.privacyAccepted
                  }
                  onChange={(
                    event,
                  ) => {
                    setFormData(
                      (current) => ({
                        ...current,
                        privacyAccepted:
                          event.target
                            .checked,
                      }),
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        privacyAccepted:
                          "",
                      }),
                    );

                    setSubmitError(
                      "",
                    );
                  }}
                />

                <span>
                  J’accepte que mes
                  informations soient
                  utilisées afin que
                  Hopla Groupe puisse
                  répondre à ma demande.
                </span>
              </label>

              {errors.privacyAccepted && (
                <p
                  className={
                    styles.fieldError
                  }
                >
                  {
                    errors.privacyAccepted
                  }
                </p>
              )}

              <div
                className={
                  styles.formNavigation
                }
              >
                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className={
                    styles.formNextButton
                  }
                >
                  Continuer

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section
              className={
                styles.formStep
              }
            >
              <span
                className={
                  styles.formEyebrow
                }
              >
                Faisons connaissance
              </span>

              <h1
                className={
                  styles.formTitle
                }
              >
                Parlez-nous de vous.
              </h1>

              <p
                className={
                  styles.formDescription
                }
              >
                Quelques informations
                nous aideront à mieux
                comprendre votre
                contexte.
              </p>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="firstName"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Prénom
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    maxLength={100}
                    value={
                      formData.firstName
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />

                  {errors.firstName && (
                    <p
                      className={
                        styles.fieldError
                      }
                    >
                      {
                        errors.firstName
                      }
                    </p>
                  )}
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="lastName"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Nom
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    maxLength={100}
                    value={
                      formData.lastName
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />

                  {errors.lastName && (
                    <p
                      className={
                        styles.fieldError
                      }
                    >
                      {
                        errors.lastName
                      }
                    </p>
                  )}
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="company"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Entreprise ou
                    organisation
                  </label>

                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    maxLength={180}
                    value={
                      formData.company
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="role"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Fonction
                  </label>

                  <input
                    id="role"
                    name="role"
                    type="text"
                    autoComplete="organization-title"
                    maxLength={180}
                    value={
                      formData.role
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="phone"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Téléphone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={50}
                    value={
                      formData.phone
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />

                  {errors.phone && (
                    <p
                      className={
                        styles.fieldError
                      }
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="country"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Pays
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    autoComplete="country-name"
                    maxLength={100}
                    value={
                      formData.country
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                  />

                  {errors.country && (
                    <p
                      className={
                        styles.fieldError
                      }
                    >
                      {
                        errors.country
                      }
                    </p>
                  )}
                </div>
              </div>

              <div
                className={
                  styles.formNavigation
                }
              >
                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  className={
                    styles.formPreviousButton
                  }
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className={
                    styles.formNextButton
                  }
                >
                  Continuer

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section
              className={
                styles.formStep
              }
            >
              <span
                className={
                  styles.formEyebrow
                }
              >
                Votre besoin
              </span>

              <h1
                className={
                  styles.formTitle
                }
              >
                De quel service
                avez-vous besoin ?
              </h1>

              <p
                className={
                  styles.formDescription
                }
              >
                Choisissez simplement
                l’univers qui correspond
                le mieux à votre
                demande.
              </p>

              <div
                className={
                  styles.serviceGrid
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    selectService(
                      "rh",
                    )
                  }
                  className={`${styles.serviceCard} ${
                    formData.service ===
                    "rh"
                      ? styles.serviceCardSelected
                      : ""
                  }`}
                >
                  <span
                    className={
                      styles.serviceIndex
                    }
                  >
                    01
                  </span>

                  <strong>
                    Services RH &
                    Organisation
                  </strong>

                  <span
                    className={
                      styles.serviceCardArrow
                    }
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectService(
                      "digital",
                    )
                  }
                  className={`${styles.serviceCard} ${
                    formData.service ===
                    "digital"
                      ? styles.serviceCardSelected
                      : ""
                  }`}
                >
                  <span
                    className={
                      styles.serviceIndex
                    }
                  >
                    02
                  </span>

                  <strong>
                    Services digitaux
                  </strong>

                  <span
                    className={
                      styles.serviceCardArrow
                    }
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectService(
                      "expert",
                    )
                  }
                  className={`${styles.serviceCard} ${styles.serviceCardWide} ${
                    formData.service ===
                    "expert"
                      ? styles.serviceCardSelected
                      : ""
                  }`}
                >
                  <span
                    className={
                      styles.serviceIndex
                    }
                  >
                    03
                  </span>

                  <strong>
                    Je souhaite parler
                    directement à un
                    expert
                  </strong>

                  <span
                    className={
                      styles.serviceCardArrow
                    }
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              </div>

              {errors.service && (
                <p
                  className={
                    styles.fieldError
                  }
                >
                  {errors.service}
                </p>
              )}

              {formData.service ===
                "expert" && (
                <div
                  className={
                    styles.expertArea
                  }
                >
                  <div
                    className={
                      styles.expertGrid
                    }
                  >
                    <article
                      className={
                        styles.expertCard
                      }
                    >
                      <span
                        className={
                          styles.expertLabel
                        }
                      >
                        Organisation &
                        Développement
                      </span>

                      <h2
                        className={
                          styles.expertTitle
                        }
                      >
                        Expert RH &
                        Organisation
                      </h2>

                      <p
                        className={
                          styles.expertText
                        }
                      >
                        Échangez
                        directement avec
                        notre expert sur
                        vos enjeux
                        d’organisation,
                        RH ou de gestion
                        de projet.
                      </p>

                      <a
                        href="https://wa.me/2250702311361"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          styles.expertWhatsapp
                        }
                      >
                        Ouvrir WhatsApp

                        <span
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </a>
                    </article>

                    <article
                      className={
                        styles.expertCard
                      }
                    >
                      <span
                        className={
                          styles.expertLabel
                        }
                      >
                        Digital &
                        Technologie
                      </span>

                      <h2
                        className={
                          styles.expertTitle
                        }
                      >
                        Expert Digital
                      </h2>

                      <p
                        className={
                          styles.expertText
                        }
                      >
                        Échangez
                        directement sur
                        votre projet
                        digital, votre
                        site ou votre
                        solution
                        technologique.
                      </p>

                      <a
                        href="https://wa.me/2250714074124"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          styles.expertWhatsapp
                        }
                      >
                        Ouvrir WhatsApp

                        <span
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </a>
                    </article>
                  </div>
                </div>
              )}

              <div
                className={
                  styles.formNavigation
                }
              >
                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  className={
                    styles.formPreviousButton
                  }
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className={
                    styles.formNextButton
                  }
                >
                  Continuer

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section
              className={
                styles.formStep
              }
            >
              <span
                className={
                  styles.formEyebrow
                }
              >
                Votre projet
              </span>

              <h1
                className={
                  styles.formTitle
                }
              >
                Parlez-nous de votre
                projet.
              </h1>

              <p
                className={
                  styles.formDescription
                }
              >
                Donnez-nous les éléments
                essentiels. Nous
                pourrons approfondir
                ensemble lors de notre
                échange.
              </p>

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="projectTitle"
                  className={
                    styles.fieldLabel
                  }
                >
                  Objet de votre demande
                </label>

                <input
                  id="projectTitle"
                  name="projectTitle"
                  type="text"
                  maxLength={200}
                  value={
                    formData.projectTitle
                  }
                  onChange={
                    updateField
                  }
                  className={
                    styles.fieldInput
                  }
                  placeholder="Ex. Refonte de notre site internet"
                />

                {errors.projectTitle && (
                  <p
                    className={
                      styles.fieldError
                    }
                  >
                    {
                      errors.projectTitle
                    }
                  </p>
                )}
              </div>

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="description"
                  className={
                    styles.fieldLabel
                  }
                >
                  Décrivez votre besoin
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  maxLength={5000}
                  value={
                    formData.description
                  }
                  onChange={
                    updateField
                  }
                  className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                  placeholder="Votre contexte, votre besoin, vos objectifs..."
                />

                {errors.description && (
                  <p
                    className={
                      styles.fieldError
                    }
                  >
                    {
                      errors.description
                    }
                  </p>
                )}
              </div>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="deadline"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Échéance envisagée
                  </label>

                  <input
                    id="deadline"
                    name="deadline"
                    type="text"
                    maxLength={150}
                    value={
                      formData.deadline
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                    placeholder="Ex. Dans 3 mois"
                  />
                </div>

                <div
                  className={
                    styles.fieldGroup
                  }
                >
                  <label
                    htmlFor="budget"
                    className={
                      styles.fieldLabel
                    }
                  >
                    Budget indicatif
                    <span>
                      {" "}
                      — optionnel
                    </span>
                  </label>

                  <input
                    id="budget"
                    name="budget"
                    type="text"
                    maxLength={150}
                    value={
                      formData.budget
                    }
                    onChange={
                      updateField
                    }
                    className={
                      styles.fieldInput
                    }
                    placeholder="Votre enveloppe estimative"
                  />
                </div>
              </div>

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="attachment"
                  className={
                    styles.fieldLabel
                  }
                >
                  Pièce jointe

                  <span>
                    {" "}
                    — optionnelle
                  </span>
                </label>

                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={
                    handleAttachmentChange
                  }
                  className={
                    styles.fileInput
                  }
                />

                {attachment && (
                  <p
                    className={
                      styles.fieldLabel
                    }
                    style={{
                      marginTop:
                        "12px",
                      marginBottom: 0,
                    }}
                  >
                    Fichier sélectionné :{" "}
                    {attachment.name}
                  </p>
                )}

                {errors.attachment && (
                  <p
                    className={
                      styles.fieldError
                    }
                  >
                    {
                      errors.attachment
                    }
                  </p>
                )}
              </div>

              {submitError && (
                <p
                  className={
                    styles.fieldError
                  }
                  role="alert"
                  style={{
                    marginTop:
                      "28px",
                  }}
                >
                  {submitError}
                </p>
              )}

              <div
                className={
                  styles.formNavigation
                }
              >
                <button
                  type="button"
                  onClick={
                    previousStep
                  }
                  disabled={
                    isSubmitting
                  }
                  className={
                    styles.formPreviousButton
                  }
                >
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className={
                    styles.formNextButton
                  }
                  aria-busy={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Envoi en cours…"
                    : "Envoyer ma demande"}

                  {!isSubmitting && (
                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </main>
  );
}