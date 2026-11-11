import type { RowDataPacket } from 'mysql2';
import type { Pool } from 'mysql2/promise';
import pool from '@/lib/db';
import { textContent, validateDraft } from './content';
export async function publishDue(database: Pick<Pool, 'getConnection'> = pool) {
  const connection = await database.getConnection(); let acquired = false; let transaction = false;
  try {
    const [mutex] = await connection.query<(RowDataPacket & { acquired: number })[]>("SELECT GET_LOCK('hopla_blog_publish_due', 0) AS acquired");
    acquired = Number(mutex[0]?.acquired) === 1;
    if (!acquired) return { published: 0, failed: 0, alreadyRunning: true };
    const [jobs] = await connection.execute<(RowDataPacket & { id: number; article_id: number })[]>("SELECT id, article_id FROM blog_publication_jobs WHERE status = 'pending' AND scheduled_at <= UTC_TIMESTAMP() ORDER BY scheduled_at, id LIMIT 25");
    let published = 0; let failed = 0;
    for (const job of jobs) {
      await connection.beginTransaction(); transaction = true;
      await connection.execute('SELECT id FROM blog_articles WHERE id = ? FOR UPDATE', [job.article_id]);
      const [current] = await connection.execute<(RowDataPacket & { revision: unknown })[]>("SELECT revision FROM blog_publication_jobs WHERE id = ? AND status = 'pending' AND scheduled_at <= UTC_TIMESTAMP() FOR UPDATE", [job.id]);
      if (!current.length) { await connection.commit(); transaction = false; continue; }
      let draft;
      try { draft = validateDraft(typeof current[0].revision === 'string' ? JSON.parse(current[0].revision) : current[0].revision, true); }
      catch { await connection.execute("UPDATE blog_publication_jobs SET status = 'failed', completed_at = UTC_TIMESTAMP() WHERE id = ?", [job.id]); await connection.commit(); transaction = false; failed++; continue; }
      await connection.execute('UPDATE blog_articles SET published = ?, published_text = ?, published_at = UTC_TIMESTAMP(), first_published_at = COALESCE(first_published_at, UTC_TIMESTAMP()), version = version + 1, updated_at = UTC_TIMESTAMP() WHERE id = ?', [JSON.stringify(draft),textContent(draft.content),job.article_id]);
      await connection.execute("UPDATE blog_publication_jobs SET status = 'completed', completed_at = UTC_TIMESTAMP() WHERE id = ?", [job.id]);
      await connection.commit(); transaction = false; published++;
    }
    return { published, failed, alreadyRunning: false };
  } catch (error) { if (transaction) await connection.rollback(); throw error; }
  finally {
    if (acquired) { try { await connection.query("SELECT RELEASE_LOCK('hopla_blog_publish_due')"); } catch { connection.destroy(); } }
    connection.release();
  }
}
