interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
}

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  step,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
        {label}
      </label>
      <input
        type={type}
        value={value}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] 
                   text-slate-900 font-bold outline-none transition-all
                   focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50
                   placeholder:text-slate-300"
      />
    </div>
  );
};

export default Input;
