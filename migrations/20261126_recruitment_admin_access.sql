-- Apply after the Part 1 offers and applications migrations.
CREATE TABLE recruitment_admin_roles (
  admin_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  role ENUM('admin', 'recruiter', 'manager') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE recruitment_admin_offer_access (
  admin_id BIGINT UNSIGNED NOT NULL,
  offer_slug VARCHAR(140) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (admin_id, offer_slug),
  INDEX recruitment_admin_offer (offer_slug),
  FOREIGN KEY (admin_id) REFERENCES recruitment_admin_roles(admin_id) ON DELETE CASCADE,
  FOREIGN KEY (offer_slug) REFERENCES recruitment_jobs(slug) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE recruitment_admin_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  configuration JSON NOT NULL,
  updated_by BIGINT UNSIGNED NOT NULL,
  updated_at DATETIME NOT NULL,
  CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recruitment_admin_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX recruitment_admin_audit_date (created_at, id)
) ENGINE=InnoDB;

CREATE TABLE recruitment_admin_mail_receipts (
  outbox_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  recipient_hash BINARY(32) NOT NULL,
  accepted_at DATETIME NOT NULL,
  PRIMARY KEY (outbox_id, recipient_hash),
  FOREIGN KEY (outbox_id) REFERENCES recrutement_emails(id) ON DELETE CASCADE
) ENGINE=InnoDB;
