CREATE TABLE IF NOT EXISTS recrutement_candidatures (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  job_slug VARCHAR(140) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  job_title VARCHAR(200) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(35) NOT NULL,
  motivation TEXT NOT NULL,
  consented_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  validated_at DATETIME NULL,
  token_hash BINARY(32) NULL UNIQUE,
  token_expires_at DATETIME NOT NULL,
  submission_key BINARY(32) NULL UNIQUE,
  INDEX recrutement_validated (validated_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recrutement_documents (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  kind ENUM('cv', 'coverLetter') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  extension VARCHAR(5) NOT NULL,
  content MEDIUMBLOB NOT NULL,
  UNIQUE KEY recrutement_document_kind (application_id, kind),
  FOREIGN KEY (application_id) REFERENCES recrutement_candidatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recrutement_rate_limits (
  bucket BINARY(32) PRIMARY KEY,
  hits INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX recrutement_rate_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recrutement_emails (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  kind ENUM('verification', 'recruiter', 'candidate') NOT NULL,
  token VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NULL,
  token_hash BINARY(32) NULL,
  sent_at DATETIME NULL,
  lease CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  next_attempt_at DATETIME NOT NULL,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX recrutement_email_due (sent_at, next_attempt_at),
  FOREIGN KEY (application_id) REFERENCES recrutement_candidatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

