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

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function JoinClassModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
  onError,
}: JoinClassModalProps) {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ accessCode: joinCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error || "Código inválido");
        return;
      }

      onSuccess?.("Você entrou na turma!");
      setJoinCode("");
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
          <DialogTitle>Entrar em Turma</DialogTitle>
          <DialogDescription className="text-slate-400">
            Digite o código de acesso fornecido por seu professor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Código de Acesso
            </label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm font-mono text-center text-lg tracking-widest uppercase"
              placeholder="EX: A3F9K2"
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
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
