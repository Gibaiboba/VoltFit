export const ProgressCircle = ({ progress }: { progress: number }) => (
  <div className="relative w-24 h-24 flex items-center justify-center scale-110">
    <svg className="w-full h-full -rotate-90">
      <circle
        cx="48"
        cy="48"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-white/5"
      />
      <circle
        cx="48"
        cy="48"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray="251"
        strokeDashoffset={251 - (251 * Math.min(progress, 100)) / 100}
        strokeLinecap="round"
        className="text-blue-500 transition-all duration-1000 ease-out"
      />
    </svg>
    <span className="absolute text-xs font-black italic text-white">
      {Math.round(progress)}%
    </span>
  </div>
);
