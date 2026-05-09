export const formatMealTime = (date: string) =>
  new Date(date).toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Превращает Date в "2026-03-09"
export const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split("T")[0];
};
// Превращает "2026-03-09" в "09.03"
export const formatToShortDate = (dateStr: string) => {
  if (!dateStr) return "--.--";
  const parts = dateStr.split("-"); // ["2026", "05", "10"]

  if (parts.length === 3) {
    // parts[2] — это день, parts[1] — это месяц
    return `${parts[2]}.${parts[1]}`;
  }

  return dateStr;
};
