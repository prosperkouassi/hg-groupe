-- Exécuter une fois, sur la base Hopla, après sauvegarde. Aucune table existante modifiée.
CREATE TABLE IF NOT EXISTS blog_articles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(150) NOT NULL UNIQUE,
  draft JSON NOT NULL,
  published JSON NULL,
  published_text MEDIUMTEXT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  first_published_at DATETIME NULL,
  published_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX blog_publication (published_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
