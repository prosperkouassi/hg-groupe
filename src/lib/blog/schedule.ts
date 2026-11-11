export function parseScheduledAt(value: unknown, now = Date.now()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Choisissez une date et une heure de publication (Africa/Abidjan).');
  const iso = `${value}:00.000Z`; const date = new Date(iso);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== iso) throw new Error('Date de publication invalide.');
  if (date.getTime() <= now + 60000) throw new Error('Choisissez une heure située au moins une minute dans le futur.');
  return { iso, sql: date.toISOString().slice(0,19).replace('T',' ') };
}
export function formatSchedule(value: string) { return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Abidjan' }).format(new Date(value)); }
