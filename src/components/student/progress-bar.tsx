export default function ProgressBar({ hasLog }: { hasLog: boolean }) {
  return (
    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
      <div
        className={`h-full transition-all duration-700 ${hasLog ? "bg-indigo-500 w-full" : "bg-blue-500 w-1/2"}`}
      />
    </div>
  );
}
