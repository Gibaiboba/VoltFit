import React from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { SetRow } from "./SetRow";
import { WorkoutExercise } from "@/types/workout";

interface ExerciseItemProps {
  ex: WorkoutExercise;
  exIndex: number;
  onRemoveExercise: (exIndex: number) => void;
  onUpdateRestTime: (exIndex: number, newSeconds: number) => void;
  onUpdateSetValues: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  onToggleSetDone: (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => void;
  onAddSet: (exIndex: number) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  ex,
  exIndex,
  onRemoveExercise,
  onUpdateRestTime,
  onUpdateSetValues,
  onToggleSetDone,
  onAddSet,
}) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          {exIndex + 1}. {ex.title}
        </h4>
        <button
          onClick={() => onRemoveExercise(exIndex)}
          className="text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {ex.video_url && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 shadow-inner relative group">
          <video
            src={ex.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-lg">
            Техника выполнения
          </span>
        </div>
      )}

      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/70">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Отдых после подходов:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateRestTime(exIndex, (ex.rest_time || 90) - 15)}
            className="w-8 h-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
          >
            -15с
          </button>
          <span className="text-xs font-black text-slate-800 min-w-[55px] text-center tabular-nums">
            {Math.floor((ex.rest_time || 90) / 60)}м {(ex.rest_time || 90) % 60}
            с
          </span>
          <button
            onClick={() => onUpdateRestTime(exIndex, (ex.rest_time || 90) + 15)}
            className="w-8 h-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
          >
            +15с
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center px-2">
          <span>Сет</span>
          <span>Вес (кг)</span>
          <span>Повторы</span>
          <span>Готово</span>
        </div>
        {ex.sets.map((set, setIndex) => (
          <SetRow
            key={setIndex}
            set={set}
            setIndex={setIndex}
            exIndex={exIndex}
            onUpdateValue={onUpdateSetValues}
            onToggleDone={onToggleSetDone}
          />
        ))}
      </div>

      <button
        onClick={() => onAddSet(exIndex)}
        className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors flex items-center justify-center gap-1.5"
      >
        <PlusCircle size={12} /> Добавить подход
      </button>
    </div>
  );
};
