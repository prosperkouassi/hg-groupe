-- Apply after the Phase 1 applications and spontaneous applications migrations.
ALTER TABLE recrutement_candidatures
  ADD COLUMN workflow_status ENUM('validated','rejected','reviewing','shortlisted','not_selected','hired')
    NOT NULL DEFAULT 'validated',
  ADD INDEX recruitment_application_dates (application_type, created_at, id),
  ADD INDEX recruitment_application_offer (job_slug, validated_at, created_at),
  ADD INDEX recruitment_application_workflow (application_type, workflow_status, validated_at, created_at);

CREATE TABLE recruitment_admin_application_notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_id BIGINT UNSIGNED NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX recruitment_note_application (application_id, id),
  FOREIGN KEY (application_id) REFERENCES recrutement_candidatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Keep the minimal audit event after deletion. Do not store names, email, notes or document content here.
CREATE TABLE recruitment_admin_application_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  application_type ENUM('job_application','spontaneous_application') NOT NULL,
  actor_id BIGINT UNSIGNED NOT NULL,
  action ENUM('status','note','delete','resend','download') NOT NULL,
  from_status VARCHAR(24) CHARACTER SET ascii NULL,
  to_status VARCHAR(24) CHARACTER SET ascii NULL,
  created_at DATETIME NOT NULL,
  INDEX recruitment_event_application (application_id, id),
  INDEX recruitment_event_date (created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
