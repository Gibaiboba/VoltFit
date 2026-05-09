import { Log } from "@/hooks/use-student-dashboard/types";

/**
 * Находит последний записанный вес пользователя до выбранной даты
 * @param history Список всех логов из базы данных
 * @param selectedDate Текущая выбранная дата в формате YYYY-MM-DD
 * @returns Строковое представление веса или "--" если запись не найдена
 */
export const getPreviousWeight = (
  history: Log[],
  selectedDate: string,
): string => {
  if (!history || history.length === 0) return "--";

  const prevLogs = [...history]
    .filter(
      (l) => l.log_date < selectedDate && l.weight != null && l.weight > 0,
    )
    .sort((a, b) => b.log_date.localeCompare(a.log_date));

  return prevLogs[0]?.weight ? prevLogs[0].weight.toString() : "--";
};
