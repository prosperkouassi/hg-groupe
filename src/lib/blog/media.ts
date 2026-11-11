import path from 'node:path';
// Must be an absolute, persistent directory outside deployment releases in production.
export function mediaDirectory() { const directory = process.env.BLOG_MEDIA_DIR; if (!directory && process.env.NODE_ENV === 'production') throw new Error('BLOG_MEDIA_DIR requis.'); return directory || path.join(process.cwd(), '.blog-media'); }
