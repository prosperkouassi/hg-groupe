import path from 'node:path';
export class BlogMediaConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = 'BlogMediaConfigurationError'; }
}
// A production path must be absolute and point outside deployment releases.
export function mediaDirectory() {
  const directory = process.env.BLOG_MEDIA_DIR?.trim();
  if (!directory && process.env.NODE_ENV === 'production') throw new BlogMediaConfigurationError('BLOG_MEDIA_DIR manque dans les variables Hostinger. Configurez le dossier persistant puis redéployez.');
  if (directory && !path.isAbsolute(directory)) throw new BlogMediaConfigurationError('BLOG_MEDIA_DIR doit être un chemin absolu sur le serveur Hostinger.');
  return directory || path.join(process.cwd(), '.blog-media');
}
