"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Flag, Zap, Scale } from "lucide-react";
import { calculateCountdown } from "@/lib/utils/dateHelpers";

interface CountdownWidgetProps {
  targetDate?: string; // onboarding_metadata.target_date
  startDate?: string; // onboarding_metadata.start_date
  currentWeight?: number; // state.formData.weight (текущий вес из лога дня)
  startWeight?: number; // onboarding_metadata.start_weight
  targetWeight?: number; // profile.target_weight
}

export default function CountdownWidget({
  targetDate,
  startDate,
  currentWeight = 0,
  startWeight = 0,
  targetWeight = 0,
}: CountdownWidgetProps) {
  // 1. Расчет прогресса времени
  const countdown = useMemo(() => {
    return calculateCountdown(targetDate, startDate);
  }, [targetDate, startDate]);

  // 2. Расчет прогресса по весу
  const weightProgressPercentage = useMemo(() => {
    if (!startWeight || !targetWeight || !currentWeight) return 0;

    if (startWeight > targetWeight) {
      // Похудение
      const totalToLose = startWeight - targetWeight;
      const lostSoFar = startWeight - currentWeight;
      if (totalToLose <= 0) return 100;
      return Math.max(
        0,
        Math.min(Math.round((lostSoFar / totalToLose) * 100), 100),
      );
    }

    if (startWeight < targetWeight) {
      // Набор массы
      const totalToGain = targetWeight - startWeight;
      const gainedSoFar = currentWeight - startWeight;
      if (totalToGain <= 0) return 100;
      return Math.max(
        0,
        Math.min(Math.round((gainedSoFar / totalToGain) * 100), 100),
      );
    }

    return 0;
  }, [startWeight, currentWeight, targetWeight]);

  if (!countdown) return null;
  const {
    daysLeft,
    progressPercentage: timeProgressPercentage,
    isOverdue,
  } = countdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden border border-slate-800 space-y-5"
    >
      <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ШАПКА ВИДЖЕТА */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Личный фитнес-марафон
            </span>
            <span className="text-xs font-bold text-slate-300">
              {isOverdue ? "Цель достигнута" : "Движение к результату"}
            </span>
          </div>
        </div>
        <div className="text-3xl font-black italic tracking-tighter text-blue-400 leading-none">
          {isOverdue ? "✓" : `${daysLeft} дн.`}
        </div>
      </div>

      {/* ⏳ ПРОГРЕСС-БАР 1: ВРЕМЯ (ОТ СТАРТА ДО ДЕДЛАЙНА) */}
      <div className="space-y-1.5 text-left">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 px-0.5">
          <span>Сроки марафона</span>
          <span className="text-blue-400 font-black">
            {timeProgressPercentage}% времени
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative border border-slate-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeProgressPercentage}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
          />
        </div>
      </div>

      {/* ⚖️ ПРОГРЕСС-БАР 2: ВЕС (ОТ СТАРТОВОГО ДО ЦЕЛЕВОГО) */}
      <div className="space-y-1.5 text-left">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 px-0.5">
          <div className="flex items-center gap-1">
            <Scale size={12} className="text-slate-500" />
            <span>Прогресс изменения веса</span>
          </div>
          <span className="text-emerald-400 font-black">
            {weightProgressPercentage}% цели
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative border border-slate-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weightProgressPercentage}%` }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
          />
        </div>
      </div>

      {/* СТАРТ / ЦЕЛЬ ТЕКСТ ПОДПИСИ */}
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500 border-t border-slate-800/60 pt-3">
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-slate-600" />
          <span>Старт: {startWeight} кг</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Цель: {targetWeight} кг</span>
          <Flag size={10} className="text-slate-600" />
        </div>
      </div>
    </motion.div>
  );
}
