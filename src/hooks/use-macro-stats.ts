import { useMemo } from "react";
import { MACRO_CONFIG } from "@/constants/nutrition";

interface MacroValues {
  p: number;
  f: number;
  c: number;
}

/**
 * Хук для превращения сырых цифр БЖУ в стандартизированный массив для плашки MacrosComboCard
 */
export const useMacroStats = (goals: MacroValues, consumed: MacroValues) => {
  return useMemo(
    () => [
      {
        ...MACRO_CONFIG.p,
        target: goals?.p || 0,
        current: consumed?.p || 0,
      },
      {
        ...MACRO_CONFIG.f,
        target: goals?.f || 0,
        current: consumed?.f || 0,
      },
      {
        ...MACRO_CONFIG.c,
        target: goals?.c || 0,
        current: consumed?.c || 0,
      },
    ],
    [goals?.p, goals?.f, goals?.c, consumed?.p, consumed?.f, consumed?.c],
    // Оптимизация: пересчитает массив только если изменятся конкретные числа БЖУ
  );
};
