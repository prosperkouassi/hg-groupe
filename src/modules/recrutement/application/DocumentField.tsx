import { useId, useRef, useState } from "react";

import styles from "./application.module.css";

export const maxDocumentSize = 5 * 1024 * 1024;

export default function DocumentField({ name, label, required }: {
  name: "cv" | "coverLetter";
  label: string;
  required: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function update(files: FileList | null) {
    const file = files?.[0];
    const message = files && files.length > 1
      ? "Déposez un seul document à la fois."
      : file && (!/\.(pdf|docx?)$/i.test(file.name) || file.size > maxDocumentSize || !file.size)
        ? "Sélectionnez un fichier PDF, DOC ou DOCX non vide de 5 Mo maximum."
        : "";
    input.current?.setCustomValidity(message);
    setFileName(file?.name ?? "");
    setError(message);
  }

  return (
    <div className={styles.document}>
      <label htmlFor={id}>
        {label} {required ? <span aria-hidden="true">*</span> : <span className={styles.hint}>(facultative)</span>}
      </label>
      <div
        className={styles.dropzone}
        data-dragging={dragging}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDragging(false);
          if (!input.current) return;
          input.current.files = event.dataTransfer.files;
          update(event.dataTransfer.files);
        }}
      >
        <input
          ref={input}
          id={id}
          className={styles.fileInput}
          name={name}
          type="file"
          accept=".pdf,.doc,.docx"
          required={required}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
          aria-invalid={error ? true : undefined}
          onChange={(event) => update(event.currentTarget.files)}
        />
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4m-4 4 4-4 4 4M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
        </svg>
        <span className={styles.fileCopy}>
          <strong>{fileName || "Choisir ou déposer un fichier"}</strong>
          <span id={`${id}-help`} className={styles.hint}>PDF, DOC ou DOCX · 5&nbsp;Mo max.</span>
          {fileName && <span className={styles.fileReplace}>Remplacer le fichier</span>}
        </span>
      </div>
      {fileName && (
        <button
          type="button"
          className={styles.fileRemove}
          aria-label={`Supprimer le fichier « ${fileName} »`}
          onClick={() => {
            if (!input.current) return;
            input.current.value = "";
            update(null);
            input.current.focus();
          }}
        >Supprimer</button>
      )}
      <div role="status" className={styles.announcement}>{fileName && !error ? `Fichier sélectionné : ${fileName}` : ""}</div>
      <div role="alert">{error && <p id={`${id}-error`} className={styles.fieldError}>{error}</p>}</div>
    </div>
  );
}
