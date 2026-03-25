import { z } from "zod";

export const MetricsSchema = z.object({
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Выберите пол" }),
  }),
  age: z
    .number({ invalid_type_error: "Введите возраст числом" })
    .int()
    .min(12, "Минимум 12 лет")
    .max(100, "Максимум 100 лет"),
  height: z
    .number({ invalid_type_error: "Введите рост числом" })
    .min(100, "Рост от 100 см")
    .max(250, "Рост до 250 см"),
  weight: z
    .number({ invalid_type_error: "Введите вес числом" })
    .min(30, "Вес от 30 кг")
    .max(300, "Вес до 300 кг"),
  target_weight: z
    .number({ invalid_type_error: "Введите целевой вес числом" })
    .min(30, "Вес от 30 кг")
    .max(300, "Вес до 300 кг"),
});

// Тип, который мы вытаскиваем прямо из схемы
export type MetricsFormData = z.infer<typeof MetricsSchema>;
