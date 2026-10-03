interface CountdownResult {
  daysLeft: number;
  progressPercentage: number;
  daysText: string;
  isOverdue: boolean; // Флаг, если дата уже прошла
}

/**
 * Функция склонения слова "день"
 */
export function getDaysDeclension(days: number): string {
  const mod10 = days % 10;
  const mod100 = days % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return "дней";
  }
  if (mod10 === 1) {
    return "день";
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return "дня";
  }
  return "дней";
}

export function calculateCountdown(
  targetDateStr?: string,
  startDateStr?: string,
): CountdownResult | null {
  if (!targetDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const timeDiff = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return {
      daysLeft: 0,
      progressPercentage: 100,
      daysText: "Цель достигнута!",
      isOverdue: true,
    };
  }

  // Точка старта — строго день запуска марафона (startDateStr)
  const start = startDateStr ? new Date(startDateStr) : new Date(today);
  start.setHours(0, 0, 0, 0);

  const totalDuration = target.getTime() - start.getTime();
  const timePassed = today.getTime() - start.getTime();

  let progressPercentage = 0;
  if (totalDuration > 0) {
    progressPercentage = Math.min(
      Math.round((timePassed / totalDuration) * 100),
      100,
    );
    if (progressPercentage < 0) progressPercentage = 0;
  }

  return {
    daysLeft,
    progressPercentage,
    daysText: `${daysLeft} ${getDaysDeclension(daysLeft)}`,
    isOverdue: false,
  };
}
