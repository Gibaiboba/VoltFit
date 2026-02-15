interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  step?: string;
}

function Input({ label, value, onChange, step = "1" }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
        {label}
      </label>
      <input
        type="number"
        step={step}
        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-semibold transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default Input;
