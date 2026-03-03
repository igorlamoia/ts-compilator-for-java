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

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  orgId: string;
  onSuccess?: (message: string, accessCode: string) => void;
  onError?: (message: string) => void;
}

export function CreateClassModal({
  open,
  onOpenChange,
  userId,
  orgId,
  onSuccess,
  onError,
}: CreateClassModalProps) {
  const [className, setClassName] = useState("");
  const [classDesc, setClassDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-org-id": orgId || "",
        },
        body: JSON.stringify({
          name: className,
          description: classDesc,
          accessCode,
        }),
      });

      if (!res.ok) {
        onError?.("Erro ao criar turma");
        return;
      }

      onSuccess?.(`Turma criada! Código de acesso: ${accessCode}`, accessCode);
      setClassName("");
      setClassDesc("");
      onOpenChange(false);
    } catch {
      onError?.("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#182f34] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados da sua turma
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto max-h-[60vh] px-6"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Nome da Turma
            </label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
              placeholder="Ex: Programação Java-- 2024"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              value={classDesc}
              onChange={(e) => setClassDesc(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm resize-none"
              placeholder="Descreva a turma..."
            />
          </div>
        </form>

        <DialogFooter className="bg-white/5 border-t border-white/10">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Turma"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
