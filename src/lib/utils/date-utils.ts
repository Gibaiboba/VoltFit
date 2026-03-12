export const getMealType = (dateString: string): string => {
  const hour = new Date(dateString).getHours();
  if (hour >= 5 && hour < 11) return "Завтрак";
  if (hour >= 11 && hour < 17) return "Обед";
  if (hour >= 17 && hour < 23) return "Ужин";
  return "Ночной перекус";
};

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
