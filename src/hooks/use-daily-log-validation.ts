"use client";

import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { DailyLogSchema, type DailyLogFormData } from "@/lib/daily-log.schema";
import { FormDataType } from "@/hooks/use-student-dashboard/types";

type ValidatedFields = "weight" | "steps" | "sleep_hours" | "water";

interface UseDailyLogValidationProps {
  formData: FormDataType;
  setFormData: (data: Partial<FormDataType>) => void;
  addWater: () => void;
  removeWater: () => void;
}

export function useDailyLogValidation({
  formData,
  setFormData,
  addWater,
  removeWater,
}: UseDailyLogValidationProps) {
  // Стейт ошибок валидации
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Реф для хранения таймеров дебаунса под каждое поле отдельно
  const debounceTimers = useRef<Record<string, NodeJS.Timeout | null>>({});

  // Живая проверка с задержкой (дебаунс 350мс)
  const handleFieldChange = (
    field: ValidatedFields,
    value: string | number,
  ) => {
    // 1. Сразу пишем в форму, чтобы UI обновлялся мгновенно
    if (field === "water") {
      if (typeof value === "number") setFormData({ water: value });
    } else {
      setFormData({ [field]: value });
    }

    // Очищаем предыдущий незаконченный таймер для этого поля
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]!);
    }

    // Если поле очистили — убираем ошибку сразу, без задержки
    if (value === "") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    // Запускаем таймер задержки: Zod сработает только тогда, когда пользователь сделает паузу в 350мс
    debounceTimers.current[field] = setTimeout(() => {
      // Собираем актуальный слепок данных для проверки
      const dataToValidate = {
        weight: formData.weight,
        steps: formData.steps,
        sleep_hours: formData.sleep_hours,
        water: formData.water,
        [field]: value,
      };

      const result = DailyLogSchema.safeParse(dataToValidate);

      if (!result.success) {
        const errorFormatted: z.ZodFormattedError<DailyLogFormData> =
          result.error.format();
        const currentFieldError = errorFormatted[field]?._errors?.[0];
        setFieldErrors((prev) => ({ ...prev, [field]: currentFieldError }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    }, 350);
  };

  // Перехватчики кнопок воды с лимитом Zod
  const handleAddWaterWithLimit = () => {
    const nextWaterValue = (formData.water || 0) + 250;
    if (nextWaterValue <= 10000) {
      addWater();
      setFieldErrors((prev) => ({ ...prev, water: undefined }));
    } else {
      setFieldErrors((prev) => ({ ...prev, water: "Максимум 10 литров воды" }));
    }
  };

  const handleRemoveWaterWithLimit = () => {
    removeWater();
    setFieldErrors((prev) => ({ ...prev, water: undefined }));
  };

  // Безопасная очистка таймеров при размонтировании (с фиксом линтера Next.js)
  useEffect(() => {
    const currentTimers = debounceTimers.current;
    return () => {
      if (currentTimers) {
        Object.values(currentTimers).forEach((t) => t && clearTimeout(t));
      }
    };
  }, []);

  // Флаг: невалидна ли форма прямо сейчас?
  const isFormInvalid = Object.values(fieldErrors).some(
    (err) => err !== undefined,
  );

  return {
    fieldErrors,
    setFieldErrors,
    handleFieldChange,
    handleAddWaterWithLimit,
    handleRemoveWaterWithLimit,
    isFormInvalid,
  };
}
