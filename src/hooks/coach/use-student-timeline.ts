"use client";
import { useMemo, useEffect } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { SavedMeal } from "@/types/food";
import { DailyLog } from "@/types/shared";
import { UserProfile } from "@/types/user";

//cтруктура завязана на реальный профиль из базы данных
export interface CoachStudent {
  student: UserProfile & {
    daily_logs?: DailyLog[];
  };
}

interface UseStudentTimelineProps {
  selectedStudent: CoachStudent | null;
  meals: SavedMeal[];
  daysLimit: number;
}

export interface TimelineItem {
  date: string;
  dayLog: DailyLog | undefined;
  dayMeals: SavedMeal[];
}

export interface WeeklyAverages {
  weight: number | null;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  sleep: number;
  water: number;
  steps: number;
}

export function useStudentTimeline({
  selectedStudent,
  meals,
  daysLimit,
}: UseStudentTimelineProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const weeklyAverages = useMemo<WeeklyAverages | null>(() => {
    if (!selectedStudent) return null;
    const logs = selectedStudent.student.daily_logs || [];
    const lastSevenLogs = logs.slice(0, 7);
    const daysCount = lastSevenLogs.length;
    if (daysCount === 0) return null;

    const totals = lastSevenLogs.reduce(
      (acc, log) => {
        acc.weight += Number(log.weight) || 0;
        acc.calories += log.calories || 0;
        acc.proteins += log.proteins || 0;
        acc.fats += log.fats || 0;
        acc.carbs += log.carbs || 0;
        acc.sleep += log.sleep_hours || 0;
        acc.water += log.water || 0;
        acc.steps += log.steps || 0;
        if (Number(log.weight) > 0) acc.weightDays++;
        return acc;
      },
      {
        weight: 0,
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
        sleep: 0,
        water: 0,
        steps: 0,
        weightDays: 0,
      },
    );

    return {
      weight:
        totals.weightDays > 0
          ? Math.round((totals.weight / totals.weightDays) * 10) / 10
          : null,
      calories: Math.round(totals.calories / daysCount),
      proteins: Math.round(totals.proteins / daysCount),
      fats: Math.round(totals.fats / daysCount),
      carbs: Math.round(totals.carbs / daysCount),
      sleep: Math.round((totals.sleep / daysCount) * 10) / 10,
      water: totals.water / daysCount / 1000,
      steps: Math.round(totals.steps / daysCount),
    };
  }, [selectedStudent]);

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!selectedStudent) return [];
    const logs = selectedStudent.student.daily_logs || [];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysLimit);
    const minIsoDate = toISODate(targetDate);

    const filteredLogs = logs.filter((l) => l.log_date >= minIsoDate);
    const logsMap = new Map<string, DailyLog>(
      filteredLogs.map((l) => [l.log_date, l]),
    );

    const mealsByDate = new Map<string, SavedMeal[]>();
    meals.forEach((meal) => {
      const dateKey = toISODate(new Date(meal.created_at));
      if (!mealsByDate.has(dateKey)) mealsByDate.set(dateKey, []);
      mealsByDate.get(dateKey)!.push(meal);
    });

    const allDates = Array.from(
      new Set([...logsMap.keys(), ...mealsByDate.keys()]),
    ).sort((a, b) => b.localeCompare(a));

    return allDates.map((date) => ({
      date,
      dayLog: logsMap.get(date),
      dayMeals: mealsByDate.get(date) || [],
    }));
  }, [selectedStudent, meals, daysLimit]);

  return { weeklyAverages, timeline };
}
