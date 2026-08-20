export interface ActivityOption {
  id: string;
  name: string;
  category: string;
  met: number;
}

export const ACTIVITIES_MAP: Record<string, ActivityOption> = {
  // Ходьба и бег
  walk_slow: {
    id: "walk_slow",
    name: "Легкая ходьба (до 5.5 км/ч)",
    category: "Ходьба/Бег",
    met: 3.3,
  },
  walk_fast: {
    id: "walk_fast",
    name: "Быстрая ходьба (5.5 - 7.0 км/ч)",
    category: "Ходьба/Бег",
    met: 4.3,
  },
  run_slow: {
    id: "run_slow",
    name: "Бег трусцой (8 км/ч)",
    category: "Ходьба/Бег",
    met: 8.3,
  },
  run_medium: {
    id: "run_medium",
    name: "Бег (10 км/ч)",
    category: "Ходьба/Бег",
    met: 9.8,
  },
  run_fast: {
    id: "run_fast",
    name: "Быстрый бег (12 км/ч)",
    category: "Ходьба/Бег",
    met: 11.8,
  },
  run_sprint: {
    id: "run_sprint",
    name: "Спринт / Высокая скорость (14 км/ч)",
    category: "Ходьба/Бег",
    met: 12.8,
  },

  // Силовые
  strength_normal: {
    id: "strength_normal",
    name: "Силовая тренировка",
    category: "Тренажерный зал",
    met: 3.5,
  },
  strength_heavy: {
    id: "strength_heavy",
    name: "Тяжелая силовая / Кроссфит / Круговая",
    category: "Тренажерный зал",
    met: 6.0,
  },

  // Велосипед
  bike_light: {
    id: "bike_light",
    name: "Легкая езда (до 15 км/ч)",
    category: "Велосипед",
    met: 4.0,
  },
  bike_hard: {
    id: "bike_hard",
    name: "Велоспорт (15-20 км/ч)",
    category: "Велосипед",
    met: 6.8,
  },

  // Плавание
  swim_normal: {
    id: "swim_normal",
    name: "Плавание в среднем темпе",
    category: "Плавание",
    met: 5.8,
  },
  swim_hard: {
    id: "swim_hard",
    name: "Интенсивное плавание",
    category: "Плавание",
    met: 9.8,
  },

  // Групповые
  group_light: {
    id: "group_light",
    name: "Растяжка / Йога / Пилатес",
    category: "Групповые",
    met: 2.5,
  },
  group_medium: {
    id: "group_medium",
    name: "Аэробика / Зумба / Танцы",
    category: "Групповые",
    met: 5.0,
  },
  group_hiit: {
    id: "group_hiit",
    name: "Высокоинтенсивный интервальный тренинг (HIIT)",
    category: "Групповые",
    met: 8.0,
  },
};
