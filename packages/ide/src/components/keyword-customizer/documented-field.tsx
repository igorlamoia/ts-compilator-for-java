import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel } from "../ui/form";

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
    <div className="group relative overflow-hidden rounded-md border border-white/8 bg-[#0E1629]/95 p-4 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.98)] backdrop-blur-xl dark:border-white/6 dark:bg-[#0B1020]/96">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/4 via-transparent to-black/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-12 top-4 h-28 w-28 rounded-full bg-white/3 blur-3xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1" />
      <div className="pointer-events-none absolute -bottom-14 right-0 h-36 w-36 rounded-full bg-slate-500/6 blur-3xl transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-1" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/3" />

      <div className="relative z-10 flex flex-col gap-3">
        <FormItem className="text-left">
          <FormLabel>{label}</FormLabel>
          <Input
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            className="border-white/10 bg-[#0a1020]/80 font-mono text-slate-200 placeholder:text-slate-500"
            spellCheck={false}
            disabled={disabled}
            aria-label={label}
          />
        </FormItem>

        <FormItem className="text-left">
          <FormLabel>Descrição</FormLabel>
          <Textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder={descriptionPlaceholder}
            className="border-white/10 bg-[#0a1020]/80 text-slate-200 placeholder:text-slate-500"
            disabled={disabled}
            aria-label={`${label} descrição`}
          />
        </FormItem>
      </div>
    </div>
  );
}
