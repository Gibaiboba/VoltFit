import Image from "next/image";
import { Camera, User as UserIcon } from "lucide-react";

interface AvatarUploadProps {
  avatarUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUpload({
  avatarUrl,
  fileInputRef,
  onUpload,
}: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon size={40} className="text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="text-white" size={20} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
      <p className="mt-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">
        Фото профиля
      </p>
    </div>
  );
}
