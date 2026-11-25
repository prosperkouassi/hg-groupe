ALTER TABLE recrutement_candidatures
  MODIFY COLUMN job_slug VARCHAR(140) CHARACTER SET ascii COLLATE ascii_bin NULL,
  MODIFY COLUMN job_title VARCHAR(200) NULL,
  ADD COLUMN application_type ENUM('job_application', 'spontaneous_application') NOT NULL DEFAULT 'job_application',
  ADD COLUMN city VARCHAR(120) NULL,
  ADD COLUMN nationality CHAR(2) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD COLUMN desired_position VARCHAR(180) NULL,
  ADD INDEX recrutement_type_validation (application_type, validated_at, created_at),
  ADD CONSTRAINT recrutement_application_type_shape CHECK (
    (
      application_type = 'job_application'
      AND job_slug IS NOT NULL AND job_title IS NOT NULL
      AND city IS NULL AND nationality IS NULL AND desired_position IS NULL
    ) OR (
      application_type = 'spontaneous_application'
      AND job_slug IS NULL AND job_title IS NULL
      AND city IS NOT NULL AND nationality IS NOT NULL AND desired_position IS NOT NULL
    )
  );
