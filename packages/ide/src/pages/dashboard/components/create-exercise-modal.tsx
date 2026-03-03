"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";

interface TestCase {
  label: string;
  input: string;
  expectedOutput: string;
}

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  userId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CreateExerciseModal({
  open,
  onOpenChange,
  classId,
  userId,
  onSuccess,
  onError,
}: CreateExerciseModalProps) {
  const [exTitle, setExTitle] = useState("");
  const [exDesc, setExDesc] = useState("");
  const [exDeadline, setExDeadline] = useState("");
  const [exWeight, setExWeight] = useState("1");
  const [showTestCases, setShowTestCases] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { label: "", input: "", expectedOutput: "" },
    { label: "", input: "", expectedOutput: "" },
    { label: "", input: "", expectedOutput: "" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          classId,
          title: exTitle,
          description: exDesc,
          deadline: exDeadline,
          gradeWeight: exWeight,
          testCases: testCases.filter(
            (tc) => tc.input.trim() || tc.expectedOutput.trim(),
          ),
        }),
      });

      if (!res.ok) {
        onError?.("Erro ao criar exercício");
        return;
      }

      onSuccess?.("Exercício criado com sucesso!");
      resetForm();
      onOpenChange(false);
    } catch {
      onError?.("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExTitle("");
    setExDesc("");
    setExDeadline("");
    setExWeight("1");
    setShowTestCases(false);
    setTestCases([
      { label: "", input: "", expectedOutput: "" },
      { label: "", input: "", expectedOutput: "" },
      { label: "", input: "", expectedOutput: "" },
    ]);
  };

  const updateTestCase = (
    idx: number,
    field: keyof TestCase,
    value: string,
  ) => {
    const updated = [...testCases];
    updated[idx] = { ...updated[idx], [field]: value };
    setTestCases(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#182f34] border-white/10 text-white max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Criar Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Defina os detalhes e casos de teste para o exercício
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] px-6"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Título
            </label>
            <input
              value={exTitle}
              onChange={(e) => setExTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
              placeholder="Ex: Hello World em Java--"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição / Instruções
            </label>
            <textarea
              value={exDesc}
              onChange={(e) => setExDesc(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm resize-none"
              placeholder="Descreva o exercício em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Prazo de Entrega
              </label>
              <input
                type="datetime-local"
                value={exDeadline}
                onChange={(e) => setExDeadline(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Peso da Nota
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={exWeight}
                onChange={(e) => setExWeight(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTestCases(!showTestCases)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/8 transition-colors text-sm"
            >
              <span className="font-medium text-slate-300">
                Casos de Teste (Opcional)
              </span>
              <span className="text-xs text-slate-500">
                {showTestCases ? "▲ Recolher" : "▼ Expandir"}
              </span>
            </button>

            {showTestCases && (
              <div className="p-4 space-y-4 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Defina pares de entrada/saída esperada para validação
                  automática do código do aluno.
                </p>
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#0dccf2]">
                        #{idx + 1}
                      </span>
                      <input
                        value={tc.label}
                        onChange={(e) =>
                          updateTestCase(idx, "label", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 bg-black/30 border border-white/10 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 transition-all text-xs"
                        placeholder="Nome do caso (opcional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Entrada (stdin)
                        </label>
                        <textarea
                          value={tc.input}
                          onChange={(e) =>
                            updateTestCase(idx, "input", e.target.value)
                          }
                          rows={3}
                          className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 transition-all text-xs font-mono resize-none"
                          placeholder="Uma linha por entrada..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Saída esperada (stdout)
                        </label>
                        <textarea
                          value={tc.expectedOutput}
                          onChange={(e) =>
                            updateTestCase(
                              idx,
                              "expectedOutput",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 transition-all text-xs font-mono resize-none"
                          placeholder="Saída esperada..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5"
          >
            {loading ? "Criando..." : "Criar Exercício"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
