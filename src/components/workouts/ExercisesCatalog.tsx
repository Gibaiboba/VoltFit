"use client";

import { useState, useMemo } from "react";
import { ExerciseTemplate } from "@/types/workout";
import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";
import { Play, Plus, X } from "lucide-react";

interface ExercisesCatalogProps {
  onSelectExercise: (exercise: ExerciseTemplate) => void;
}

// Словарь для отображения понятных названий категорий на русском
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  All: "Все",
  chest: "Грудь",
  back: "Спина",
  legs: "Ноги",
  shoulders: "Плечи",
  arms: "Руки",
  abs: "Пресс",
  cardio: "Кардио",
};

export default function ExercisesCatalog({
  onSelectExercise,
}: ExercisesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Собираем список уникальных английских категорий из базы данных
  const categories = useMemo(() => {
    const allCats = EXERCISES_DATABASE.map((ex) => ex.category);
    return ["All", ...Array.from(new Set(allCats))];
  }, []);

  // Фильтруем упражнения по выбранному табу
  const filteredExercises = useMemo(() => {
    if (activeCategory === "All") return EXERCISES_DATABASE;
    return EXERCISES_DATABASE.filter((ex) => ex.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-4 w-full">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
        Библиотека упражнений
      </h4>

      {/* Кнопки категорий с горизонтальным скроллом на мобилках */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap snap-center ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {CATEGORY_TRANSLATIONS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Сетка упражнений */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-2xl group hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Превьюшка видео с иконкой Play или дефолтный эмодзи */}
              <div className="relative w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-xl overflow-hidden shadow-sm shrink-0">
                <span>{ex.image}</span>
                {ex.video_url && (
                  <button
                    onClick={() => setActiveVideoUrl(ex.video_url || null)}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <Play size={14} className="text-white fill-white" />
                  </button>
                )}
              </div>

              <div>
                <span className="text-sm font-bold text-slate-800 block leading-tight">
                  {ex.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {ex.target_muscle ||
                    CATEGORY_TRANSLATIONS[ex.category] ||
                    ex.category}
                </span>
              </div>
            </div>

            {/* Кнопка добавления в тренировку */}
            <button
              onClick={() => onSelectExercise(ex)}
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl transition-all active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно (оверлей) для видео-инструкции техники */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-full aspect-video bg-black relative">
              <video
                src={activeVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Техника выполнения
              </span>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
