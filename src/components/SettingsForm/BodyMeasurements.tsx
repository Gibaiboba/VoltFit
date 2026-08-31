import Input from "@/components/shared/input";

interface BodyMeasurementsProps {
  chest: string;
  waist: string;
  hips: string;
  onChange: (field: "chest" | "waist" | "hips") => (val: string) => void;
}

export function BodyMeasurements({
  chest,
  waist,
  hips,
  onChange,
}: BodyMeasurementsProps) {
  return (
    <div className="pt-2 space-y-3">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
        Обмеры тела (см)
      </p>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Грудь" value={chest} onChange={onChange("chest")} />
        <Input label="Талия" value={waist} onChange={onChange("waist")} />
        <Input label="Бедра" value={hips} onChange={onChange("hips")} />
      </div>
    </div>
  );
}
