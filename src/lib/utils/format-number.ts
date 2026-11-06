export const formatNumber = (num: number | string) => {
  return Number(num).toLocaleString("en-US");
};

export const formatWater = (ml: number | string) => {
  return (Number(ml) / 1000).toFixed(1);
};

/**
 * Превращает количество секунд в строку формата ММ:СС
 * Пример: 125 -> "02:05"
 */
export const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
