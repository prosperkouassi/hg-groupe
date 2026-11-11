-- Ajouter les fonctions IA et programmation à la base Hopla existante.
CREATE TABLE IF NOT EXISTS blog_publication_jobs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  article_id INT UNSIGNED NOT NULL,
  revision JSON NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_by INT UNSIGNED NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX blog_jobs_due (status, scheduled_at, article_id),
  INDEX blog_jobs_article (article_id, status),
  CONSTRAINT blog_jobs_article_fk FOREIGN KEY (article_id) REFERENCES blog_articles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_ai_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  model VARCHAR(100) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'started',
  total_tokens INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX blog_ai_daily (admin_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
