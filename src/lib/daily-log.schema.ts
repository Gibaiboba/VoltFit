import { z } from "zod";

export const DailyLogSchema = z.object({
  weight: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return 0;
      if (typeof val === "string") {
        const sanitized = val.replace(",", ".");
        return sanitized === "" ? 0 : Number(sanitized);
      }
      return Number(val);
    },
    z
      .number({ invalid_type_error: "Введите корректный вес" })
      .min(30, "Минимальный вес — 30 кг")
      .max(250, "Максимальный вес — 250 кг"),
  ),

  steps: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return 0;
      if (typeof val === "string") return val === "" ? 0 : Number(val);
      return Number(val);
    },
    z
      .number({ invalid_type_error: "Введите число шагов" })
      .int("Шаги должны быть целым числом")
      .min(0, "Минимум 0 шагов")
      .max(100000, "Максимум 100 000 шагов"),
  ),

  sleep_hours: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return 0;
      if (typeof val === "string") {
        const sanitized = val.replace(",", ".");
        return sanitized === "" ? 0 : Number(sanitized);
      }
      return Number(val);
    },
    z
      .number({ invalid_type_error: "Введите время сна" })
      .min(0, "Минимум 0 часов сна")
      .max(24, "В сутках только 24 часа"),
  ),

  // ОГРАНИЧЕНИЕ НА ВОДУ: Максимум 10 000 мл (10 литров)
  water: z.number().min(0, "Минимум 0 мл").max(10000, "Максимум 10 литров"),
});

export type DailyLogFormData = z.infer<typeof DailyLogSchema>;
