import { useCoachStore } from "@/store/useCoachStore";
import LogHistory from "@/components/shared/LogHistory";

export default function StudentModal() {
  const { selectedStudent, setSelectedStudent } = useCoachStore();

  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col scale-in-center">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {selectedStudent.student.full_name}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
              История активности
            </p>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-500 font-black"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-8 pt-4 custom-scrollbar">
          <LogHistory logs={selectedStudent.student.daily_logs} title="" />
        </div>
      </div>
    </div>
  );
}
