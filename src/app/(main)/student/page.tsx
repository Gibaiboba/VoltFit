"use client";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useLogStore } from "@/store/useLogStore";
import { toast } from "sonner";
import LogHistory from "@/components/shared/LogHistory";
import Input from "@/components/shared/input";

export default function StudentPage() {
  // 1. Данные из сторов
  const { user } = useUserStore();
  const { history, loading, fetchHistory, saveLog } = useLogStore();

  const [formData, setFormData] = useState({
    steps: "",
    weight: "",
    calories: "",
    sleepHours: "",
    activityLevel: "День без тренировок",
  });

  const activityOptions = [
    "Силовая тренировка",
    "Кардио тренировка",
    "Групповая тренировка",
    "День без тренировок",
  ];

  // 3. Загрузка истории при входе
  useEffect(() => {
    if (user?.id) fetchHistory(user.id);
  }, [user?.id, fetchHistory]);

  // 4. Проверка записи за сегодня
  const todayStr = new Date().toLocaleDateString("en-CA");
  const alreadyLoggedToday = history.some((log) => log.log_date === todayStr);

  const handleSave = async () => {
    if (!user?.id) return toast.error("Ошибка авторизации");
    if (!formData.steps || !formData.weight)
      return toast.warning("Заполните шаги и вес");

    const result = await saveLog(user.id, {
      log_date: todayStr,
      steps: parseInt(formData.steps) || 0,
      weight: parseFloat(formData.weight) || 0,
      calories: parseInt(formData.calories) || 0,
      sleep_hours: parseFloat(formData.sleepHours) || 0,
      activity_level: formData.activityLevel,
    });

    if (result.success) {
      toast.success(
        alreadyLoggedToday ? "Данные обновлены" : "Данные сохранены",
      );
      // Очищаем поля (кроме веса, его удобно оставить для следующего раза)
      setFormData((prev) => ({
        ...prev,
        steps: "",
        calories: "",
        sleepHours: "",
      }));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
          {alreadyLoggedToday && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
              Обновление данных за сегодня
            </div>
          )}

          <h1 className="text-3xl font-black text-slate-800 text-center mb-8">
            Volt<span className="text-blue-600">Fit</span>
          </h1>

          <div className="space-y-5">
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({ ...formData, activityLevel: e.target.value })
              }
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-semibold"
            >
              {activityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Сетка инпутов */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Шаги"
                value={formData.steps}
                onChange={(v) => setFormData({ ...formData, steps: v })}
              />
              <Input
                label="Вес (кг)"
                value={formData.weight}
                onChange={(v) => setFormData({ ...formData, weight: v })}
                step="0.1"
              />
              <Input
                label="Ккал"
                value={formData.calories}
                onChange={(v) => setFormData({ ...formData, calories: v })}
              />
              <Input
                label="Сон (ч)"
                value={formData.sleepHours}
                onChange={(v) => setFormData({ ...formData, sleepHours: v })}
                step="0.5"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest text-sm active:scale-95"
            >
              {alreadyLoggedToday ? "Обновить отчет" : "Отправить данные"}
            </button>
          </div>
        </div>

        {/* История из стора */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          <LogHistory
            logs={history}
            loading={loading}
            title="📊 Ваша история"
          />
        </div>
      </div>
    </div>
  );
}
