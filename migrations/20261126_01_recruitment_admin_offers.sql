-- Apply after 20261125_recruitment_jobs.sql. Preserve its public columns and semantics.
CREATE TABLE recruitment_recruiters (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(180) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX recruitment_recruiter_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE recruitment_jobs
  ADD COLUMN recruiter_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN image_url VARCHAR(500) NULL,
  ADD COLUMN attachments JSON NULL,
  ADD COLUMN deleted_at DATETIME NULL,
  ADD INDEX recruitment_jobs_recruiter (recruiter_id, slug),
  ADD INDEX recruitment_jobs_admin_publication (deleted_at, published_at, slug),
  ADD CONSTRAINT recruitment_jobs_recruiter_fk
    FOREIGN KEY (recruiter_id) REFERENCES recruitment_recruiters(id) ON DELETE RESTRICT;

-- Provision the initial profile explicitly through the recruitment admin.
-- Application rollback to Part 1 can keep the added columns and tables in place.
-- For a later schema rollback, back up Part 2 data and drop dependent grants,
-- then drop recruitment_jobs_recruiter_fk and the five added columns before
-- dropping recruitment_recruiters. The Part 1 recruiter JSON remains readable.
