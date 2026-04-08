interface ProgressBarProps {
  hasLog: boolean;
}

export const ProgressBar = ({ hasLog }: ProgressBarProps) => (
  <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-20">
    <div
      className={`h-full transition-all duration-1000 ease-in-out ${
        hasLog ? "bg-emerald-500 w-full" : "bg-blue-500 w-1/2"
      }`}
    />
  </div>
);
