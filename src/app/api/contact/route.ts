import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MIN_SUBMISSION_TIME =
  3000;

const MAX_FORM_AGE =
  24 * 60 * 60 * 1000;

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const allowedServices = [
  "rh",
  "digital",
  "expert",
];

function getRequiredEnv(
  key: string,
) {
  const value =
    process.env[key];

  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${key}`,
    );
  }

  return value;
}

function getServiceLabel(
  service: string,
) {
  switch (service) {
    case "rh":
      return "RH & Organisation";

    case "digital":
      return "Services digitaux";

    case "expert":
      return "Demande d'échange avec un expert";

    default:
      return "Non renseigné";
  }
}

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(
  email: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function isWithinLength(
  value: string,
  maxLength: number,
) {
  return value.length <= maxLength;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const formData =
      await request.formData();

    /*
     * Anti-spam :
     * champ invisible destiné aux robots.
     *
     * Un véritable utilisateur ne peut
     * normalement jamais le remplir.
     */
    const website =
      String(
        formData.get("website") ?? "",
      ).trim();

    if (website) {
      /*
       * On renvoie volontairement un succès
       * au robot pour ne pas lui révéler
       * que son message a été bloqué.
       */
      return NextResponse.json(
        {
          success: true,
          message:
            "Votre demande a bien été envoyée.",
        },
        {
          status: 200,
        },
      );
    }

    /*
     * Anti-spam :
     * vérification du temps passé
     * sur le formulaire.
     */
    const formStartedAt =
      Number(
        String(
          formData.get(
            "formStartedAt",
          ) ?? "",
        ),
      );

    const now =
      Date.now();

    if (
      !Number.isFinite(
        formStartedAt,
      ) ||
      formStartedAt <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La session du formulaire n'est plus valide. Veuillez actualiser la page.",
        },
        {
          status: 400,
        },
      );
    }

    const formAge =
      now - formStartedAt;

    if (
      formAge <
      MIN_SUBMISSION_TIME
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La demande a été envoyée trop rapidement. Veuillez patienter quelques secondes puis réessayer.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      formAge >
      MAX_FORM_AGE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre session a expiré. Veuillez actualiser la page avant de recommencer.",
        },
        {
          status: 400,
        },
      );
    }

    const email =
      String(
        formData.get("email") ?? "",
      ).trim();

    const firstName =
      String(
        formData.get("firstName") ?? "",
      ).trim();

    const lastName =
      String(
        formData.get("lastName") ?? "",
      ).trim();

    const company =
      String(
        formData.get("company") ?? "",
      ).trim();

    const role =
      String(
        formData.get("role") ?? "",
      ).trim();

    const phone =
      String(
        formData.get("phone") ?? "",
      ).trim();

    const country =
      String(
        formData.get("country") ?? "",
      ).trim();

    const service =
      String(
        formData.get("service") ?? "",
      ).trim();

    const projectTitle =
      String(
        formData.get(
          "projectTitle",
        ) ?? "",
      ).trim();

    const description =
      String(
        formData.get(
          "description",
        ) ?? "",
      ).trim();

    const deadline =
      String(
        formData.get("deadline") ?? "",
      ).trim();

    const budget =
      String(
        formData.get("budget") ?? "",
      ).trim();

    const privacyAccepted =
      String(
        formData.get(
          "privacyAccepted",
        ) ?? "",
      ) === "true";

    const attachment =
      formData.get("attachment");

    /*
     * Validation des champs obligatoires.
     */
    if (
      !email ||
      !firstName ||
      !lastName ||
      !phone ||
      !country ||
      !service ||
      !projectTitle ||
      !description ||
      !privacyAccepted
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Certains champs obligatoires sont manquants.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validation de l'adresse e-mail.
     */
    if (
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "L'adresse e-mail n'est pas valide.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validation du service.
     *
     * On n'accepte que les valeurs
     * réellement proposées dans
     * le formulaire.
     */
    if (
      !allowedServices.includes(
        service,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le service sélectionné n'est pas valide.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Limites de longueur.
     *
     * Elles évitent notamment les
     * soumissions volontairement énormes.
     */
    const lengthChecks = [
      {
        value: email,
        max: 254,
      },
      {
        value: firstName,
        max: 100,
      },
      {
        value: lastName,
        max: 100,
      },
      {
        value: company,
        max: 180,
      },
      {
        value: role,
        max: 180,
      },
      {
        value: phone,
        max: 50,
      },
      {
        value: country,
        max: 100,
      },
      {
        value: projectTitle,
        max: 200,
      },
      {
        value: description,
        max: 5000,
      },
      {
        value: deadline,
        max: 150,
      },
      {
        value: budget,
        max: 150,
      },
    ];

    const hasOversizedField =
      lengthChecks.some(
        ({ value, max }) =>
          !isWithinLength(
            value,
            max,
          ),
      );

    if (hasOversizedField) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Certaines informations saisies sont trop longues.",
        },
        {
          status: 400,
        },
      );
    }

    const attachments:
      {
        filename: string;
        content: Buffer;
        contentType?: string;
      }[] = [];

    if (
      attachment instanceof File &&
      attachment.size > 0
    ) {
      if (
        attachment.size >
        MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "La pièce jointe dépasse la taille maximale autorisée de 5 Mo.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !allowedMimeTypes.includes(
          attachment.type,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Le format de la pièce jointe n'est pas autorisé.",
          },
          {
            status: 400,
          },
        );
      }

      const arrayBuffer =
        await attachment.arrayBuffer();

      attachments.push({
        filename:
          attachment.name,
        content:
          Buffer.from(
            arrayBuffer,
          ),
        contentType:
          attachment.type,
      });
    }

    const smtpHost =
      getRequiredEnv(
        "SMTP_HOST",
      );

    const smtpPort =
      Number(
        getRequiredEnv(
          "SMTP_PORT",
        ),
      );

    const smtpSecure =
      getRequiredEnv(
        "SMTP_SECURE",
      ) === "true";

    const smtpUser =
      getRequiredEnv(
        "SMTP_USER",
      );

    const smtpPassword =
      getRequiredEnv(
        "SMTP_PASSWORD",
      );

    const fromAddress =
      getRequiredEnv(
        "CONTACT_EMAIL_FROM",
      );

    const recipients = [
      getRequiredEnv(
        "CONTACT_EMAIL_MANON",
      ),
      getRequiredEnv(
        "CONTACT_EMAIL_PROSPER",
      ),
      getRequiredEnv(
        "CONTACT_EMAIL_CONTACT",
      ),
    ];

    const transporter =
      nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,

        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

    const serviceLabel =
      getServiceLabel(
        service,
      );

    const fullName =
      `${firstName} ${lastName}`
        .trim();

    const subject =
      `Nouvelle demande de contact — ${serviceLabel}`;

    const safeFullName =
      escapeHtml(fullName);

    const safeEmail =
      escapeHtml(email);

    const safePhone =
      escapeHtml(phone);

    const safeCountry =
      escapeHtml(country);

    const safeCompany =
      escapeHtml(
        company ||
          "Non renseigné",
      );

    const safeRole =
      escapeHtml(
        role ||
          "Non renseignée",
      );

    const safeService =
      escapeHtml(
        serviceLabel,
      );

    const safeProjectTitle =
      escapeHtml(
        projectTitle,
      );

    const safeDescription =
      escapeHtml(
        description,
      ).replaceAll(
        "\n",
        "<br />",
      );

    const safeDeadline =
      escapeHtml(
        deadline ||
          "Non renseignée",
      );

    const safeBudget =
      escapeHtml(
        budget ||
          "Non renseigné",
      );

    const html = `
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>
            Nouvelle demande Hopla Groupe
          </title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
            color:#081426;
          "
        >
          <table
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            role="presentation"
          >
            <tr>
              <td
                align="center"
                style="
                  padding:40px 20px;
                "
              >
                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  role="presentation"
                  style="
                    max-width:720px;
                    background:#ffffff;
                    border-collapse:collapse;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:36px 40px;
                        background:#050b16;
                        color:#ffffff;
                      "
                    >
                      <div
                        style="
                          font-size:11px;
                          letter-spacing:.16em;
                          text-transform:uppercase;
                          opacity:.55;
                        "
                      >
                        Hopla Groupe
                      </div>

                      <h1
                        style="
                          margin:16px 0 0;
                          font-size:28px;
                          line-height:1.2;
                          font-weight:600;
                        "
                      >
                        Nouvelle demande de contact
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:38px 40px;
                      "
                    >
                      <h2
                        style="
                          margin:0 0 18px;
                          font-size:20px;
                        "
                      >
                        ${safeProjectTitle}
                      </h2>

                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        role="presentation"
                        style="
                          border-collapse:collapse;
                        "
                      >
                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                              width:190px;
                            "
                          >
                            Nom
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeFullName}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            E-mail
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeEmail}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Téléphone
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safePhone}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Pays
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeCountry}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Entreprise
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeCompany}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Fonction
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeRole}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Service
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeService}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Échéance
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeDeadline}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding:10px 0;
                              color:#6b7280;
                            "
                          >
                            Budget
                          </td>

                          <td
                            style="
                              padding:10px 0;
                            "
                          >
                            ${safeBudget}
                          </td>
                        </tr>
                      </table>

                      <div
                        style="
                          margin-top:32px;
                          padding-top:28px;
                          border-top:1px solid #e5e7eb;
                        "
                      >
                        <div
                          style="
                            margin-bottom:12px;
                            color:#6b7280;
                            font-size:13px;
                            font-weight:600;
                            text-transform:uppercase;
                            letter-spacing:.08em;
                          "
                        >
                          Description du besoin
                        </div>

                        <div
                          style="
                            font-size:15px;
                            line-height:1.7;
                          "
                        >
                          ${safeDescription}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
Nouvelle demande Hopla Groupe

Objet :
${projectTitle}

Nom :
${fullName}

E-mail :
${email}

Téléphone :
${phone}

Pays :
${country}

Entreprise :
${company || "Non renseigné"}

Fonction :
${role || "Non renseignée"}

Service :
${serviceLabel}

Échéance :
${deadline || "Non renseignée"}

Budget :
${budget || "Non renseigné"}

Description :
${description}
    `.trim();

    /*
     * Chaque destinataire reçoit
     * son propre exemplaire.
     */
    for (
      const recipient of recipients
    ) {
      await transporter.sendMail({
        from:
          `"Hopla Groupe" <${fromAddress}>`,

        to: recipient,

        replyTo: email,

        subject,

        text,

        html,

        attachments,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Votre demande a bien été envoyée.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erreur formulaire contact :",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue pendant l'envoi de votre demande.",
      },
      {
        status: 500,
      },
    );
  }
}