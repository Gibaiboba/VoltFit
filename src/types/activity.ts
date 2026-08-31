import { FormUpdater, FormDataType } from "@/hooks/use-student-dashboard/types";

export interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDataType;
  setFormData: (updater: FormUpdater) => void;
  onSave: () => void;
  isSaving: boolean;
}
