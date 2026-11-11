import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class AIRequestLimitError extends Error {
  status: number;
  constructor(message: string, status = 429) { super(message); this.status = status; }
}

/** Reserve the quota while holding a short lock. No connection survives the AI call. */
export async function reserveAIRequest(database: Pool, adminId: number, model: string, dailyLimit: number) {
  const connection = await database.getConnection();
  const lockName = `hopla_blog_ai_${adminId}`;
  let locked = false; let usable = true;
  try {
    const [mutex] = await connection.query<(RowDataPacket & { acquired: number })[]>('SELECT GET_LOCK(?, 0) AS acquired', [lockName]);
    if (Number(mutex[0]?.acquired) !== 1) throw new AIRequestLimitError('Une génération est déjà en préparation. Réessayez dans quelques instants.');
    locked = true;
    const [active] = await connection.execute<(RowDataPacket & { total: number })[]>("SELECT COUNT(*) AS total FROM blog_ai_requests WHERE admin_id = ? AND status = 'generating' AND created_at >= UTC_TIMESTAMP() - INTERVAL 5 MINUTE", [adminId]);
    if (Number(active[0].total)) throw new AIRequestLimitError('Une génération est déjà en cours. Patientez avant de réessayer.');
    const [counts] = await connection.execute<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM blog_ai_requests WHERE admin_id = ? AND created_at >= UTC_DATE()', [adminId]);
    if (Number(counts[0].total) >= dailyLimit) throw new AIRequestLimitError('Limite quotidienne de génération atteinte.');
    const [record] = await connection.execute<ResultSetHeader>("INSERT INTO blog_ai_requests (admin_id, model, status, created_at) VALUES (?, ?, 'generating', UTC_TIMESTAMP())", [adminId,model]);
    return record.insertId;
  } finally {
    if (locked) {
      try { await connection.query('SELECT RELEASE_LOCK(?)', [lockName]); }
      catch { usable = false; connection.destroy(); }
    }
    if (usable) connection.release();
  }
}

/** Logging failure must never discard a successfully generated article. */
export async function finishAIRequest(database: Pick<Pool, 'execute'>, id: number, status: 'completed' | 'failed', totalTokens = 0) {
  try {
    await database.execute('UPDATE blog_ai_requests SET status = ?, total_tokens = ? WHERE id = ?', [status,Math.max(0,Math.floor(totalTokens)),id]);
  } catch (error) {
    console.warn('Blog IA : journal indisponible', { code: (error as { code?: string }).code || 'CONNECTION_UNAVAILABLE' });
  }
}
