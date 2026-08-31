import { z } from "zod";

export const MetricsSchema = z.object({
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Выберите пол" }),
  }),
  birth_date: z
    .string({ required_error: "Укажите дату рождения" })
    .min(1, "Укажите дату рождения")
    .refine(
      (dateString) => {
        const birth = new Date(dateString);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && now.getDate() < birth.getDate())
        ) {
          age--;
        }
        return age >= 12;
      },
      { message: "Минимальный возраст — 12 лет" },
    )
    .refine(
      (dateString) => {
        const birth = new Date(dateString);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && now.getDate() < birth.getDate())
        ) {
          age--;
        }
        return age <= 100;
      },
      { message: "Максимальный возраст — 100 лет" },
    ),
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

export type MetricsFormData = z.infer<typeof MetricsSchema>;
