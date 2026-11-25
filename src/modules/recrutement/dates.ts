const timeZone = "Africa/Abidjan";
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone,
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatPublication(value: string) {
  return `Publiée le ${formatDate(value)} à ${timeFormatter.format(new Date(value)).replace(":", "h")}`;
}
