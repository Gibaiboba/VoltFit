import React from "react";
import { CheckCircle } from "lucide-react";
import { WorkoutSet } from "@/types/workout";

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exIndex: number;
  onUpdateValue: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  onToggleDone: (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  setIndex,
  exIndex,
  onUpdateValue,
  onToggleDone,
}) => {
  return (
    <div
      className={`grid grid-cols-4 gap-2 items-center text-center p-1 rounded-xl transition-colors ${
        set.done ? "bg-emerald-50/50" : ""
      }`}
    >
      <span className="font-black text-slate-400 text-xs">#{setIndex + 1}</span>
      <input
        type="number"
        inputMode="decimal"
        value={set.weight}
        onChange={(e) =>
          onUpdateValue(exIndex, setIndex, "weight", e.target.value)
        }
        className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
      />
      <input
        type="number"
        inputMode="numeric"
        value={set.reps}
        onChange={(e) =>
          onUpdateValue(exIndex, setIndex, "reps", e.target.value)
        }
        className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
      />
      <button
        onClick={() => onToggleDone(exIndex, setIndex, set.done)}
        className={`mx-auto p-2 rounded-xl border-2 transition-all ${
          set.done
            ? "bg-emerald-500 border-emerald-500 text-white scale-105"
            : "border-slate-200 text-transparent"
        }`}
      >
        <CheckCircle
          size={14}
          className={set.done ? "text-white" : "text-slate-200"}
        />
      </button>
    </div>
  );
};
