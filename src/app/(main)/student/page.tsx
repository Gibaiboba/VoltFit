"use client";
import { useState, useEffect, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useLogStore } from "@/store/useLogStore";
import { toast } from "sonner";
import { Calendar, ChevronDown, Rocket, Sparkles } from "lucide-react";
import LogHistory from "@/components/shared/LogHistory";
import Input from "@/components/shared/input";
import ActivityVisualizer, {
  ChartPoint,
} from "@/components/shared/ActivityVisualizer";

const ACTIVITY_OPTIONS = [
  "Силовая тренировка",
  "Кардио тренировка",
  "Групповая тренировка",
  "День без тренировк",
];

export default function StudentPage() {
  const { user } = useUserStore();
  const { history, loading, fetchHistory, saveLog } = useLogStore();

  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [formData, setFormData] = useState({
    steps: "",
    weight: "",
    calories: "",
    sleepHours: "",
    activityLevel: "День без тренировок",
  });

  useEffect(() => {
    if (user?.id) fetchHistory(user.id);
  }, [user?.id, fetchHistory]);

  // Подготовка данных для графиков (последние 7 записей)
  const chartData = useMemo(() => {
    if (!history.length) return { steps: [], calories: [] };

    const sorted = [...history]
      .sort(
        (a, b) =>
          new Date(a.log_date).getTime() - new Date(b.log_date).getTime(),
      )
      .slice(-7);

    return {
      steps: sorted.map(
        (l): ChartPoint => ({
          x: l.log_date,
          y: Number(l.steps) || 0,
        }),
      ),
      calories: sorted.map(
        (l): ChartPoint => ({
          x: l.log_date,
          y: Number(l.calories) || 0,
        }),
      ),
    };
  }, [history]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existingLog = history.find((l) => l.log_date === date);

    if (existingLog) {
      setFormData({
        steps: existingLog.steps.toString(),
        weight: existingLog.weight.toString(),
        calories: existingLog.calories.toString(),
        sleepHours: existingLog.sleep_hours.toString(),
        activityLevel: existingLog.activity_level,
      });
    } else {
      setFormData({
        steps: "",
        weight: history[0]?.weight?.toString() || "",
        calories: "",
        sleepHours: "",
        activityLevel: "День без тренировок",
      });
    }
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return toast.error("Ошибка авторизации");

    const result = await saveLog(user.id, {
      log_date: selectedDate,
      steps: parseInt(formData.steps) || 0,
      weight: parseFloat(formData.weight) || 0,
      calories: parseInt(formData.calories) || 0,
      sleep_hours: parseFloat(formData.sleepHours) || 0,
      activity_level: formData.activityLevel,
    });

    if (result.success) toast.success("Данные сохранены");
    else toast.error(result.error);
  };

  const isToday = selectedDate === todayStr;
  const hasLog = history.some((l) => l.log_date === selectedDate);

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Секция с графиками */}
        {history.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ActivityVisualizer
              title="👟 Активность за неделю"
              unit="шагов"
              data={chartData.steps}
              color="blue"
            />
            <ActivityVisualizer
              title="🔥 Сожженные калории"
              unit="ккал"
              data={chartData.calories}
              color="rose"
            />
          </div>
        )}

        {/* Основная форма */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                hasLog ? "bg-indigo-500 w-full" : "bg-blue-500 w-1/2"
              }`}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-600 outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => !isToday && handleDateChange(todayStr)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto ${
                isToday
                  ? "bg-white text-blue-500 border border-slate-200 cursor-default"
                  : "bg-orange-500 text-white shadow-lg shadow-orange-200 hover:scale-105 active:scale-95"
              }`}
            >
              {isToday ? "● Сегодня" : "📅 Вернуться в сегодня"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Уровень активности
              </label>
              <div className="relative group">
                <select
                  value={formData.activityLevel}
                  onChange={(e) => updateField("activityLevel")(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent group-hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all appearance-none cursor-pointer pr-10 text-slate-700"
                >
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Шаги"
                value={formData.steps}
                onChange={updateField("steps")}
              />
              <Input
                label="Вес (кг)"
                value={formData.weight}
                onChange={updateField("weight")}
                step="0.1"
              />
              <Input
                label="Ккал"
                value={formData.calories}
                onChange={updateField("calories")}
              />
              <Input
                label="Сон (ч)"
                value={formData.sleepHours}
                onChange={updateField("sleepHours")}
                step="0.5"
              />
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm active:scale-95 flex justify-center items-center gap-3 ${
                hasLog
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {hasLog ? (
                <>
                  <Sparkles className="w-5 h-5" /> Обновить данные
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" /> Сохранить отчет
                </>
              )}
            </button>
          </div>
        </div>

        <LogHistory
          logs={history}
          loading={loading}
          title="📊 История активности"
          onLogClick={(date) => {
            handleDateChange(date);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
