import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type DocumentedFieldProps = {
  label: string;
  value: string;
  description: string;
  onValueChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  placeholder?: string;
  descriptionPlaceholder?: string;
  disabled?: boolean;
};

export function DocumentedField({
  label,
  value,
  description,
  onValueChange,
  onDescriptionChange,
  placeholder,
  descriptionPlaceholder = "Descreva como esse item funciona na linguagem.",
  disabled = false,
}: DocumentedFieldProps) {
  return (
    <div className="backdrop-blur-xs flex flex-col gap-3 rounded-md border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/20">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </span>
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          className="font-mono"
          spellCheck={false}
          disabled={disabled}
          aria-label={label}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Descrição
        </span>
        <Textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={descriptionPlaceholder}
          disabled={disabled}
          aria-label={`${label} descrição`}
        />
      </label>
    </div>
  );
}
