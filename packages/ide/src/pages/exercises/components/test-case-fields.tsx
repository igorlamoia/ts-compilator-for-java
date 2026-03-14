import type { Control, FieldArrayWithId } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TestCaseFields({
  fields,
  control,
}: {
  fields: FieldArrayWithId[];
  control: Control<any>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Pares de entrada/saída para validação automática do código do aluno.
      </p>
      {fields.map((field, idx) => (
        <div
          key={field.id}
          className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0dccf2]">#{idx + 1}</span>
            <FormField
              control={control}
              name={`testCases.${idx}.label`}
              render={({ field: caseField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...caseField}
                      placeholder="Nome do caso (opcional)"
                      className="h-9 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`testCases.${idx}.input`}
              render={({ field: caseField }) => (
                <FormItem>
                  <FormLabel className="text-xs normal-case tracking-normal text-slate-500">
                    Entrada (stdin)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...caseField}
                      rows={3}
                      placeholder="Uma linha por entrada..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs font-mono focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`testCases.${idx}.expectedOutput`}
              render={({ field: caseField }) => (
                <FormItem>
                  <FormLabel className="text-xs normal-case tracking-normal text-slate-500">
                    Saída esperada (stdout)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...caseField}
                      rows={3}
                      placeholder="Saída esperada..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs font-mono focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
