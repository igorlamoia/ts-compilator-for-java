import { GripVertical, X } from "lucide-react";
import type { ExerciseListItem } from "@/types/api";

export function ExerciseRow({
  item,
  index,
  onRemove,
}: {
  item: ExerciseListItem;
  index: number;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 px-6 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
      <GripVertical className="w-4 h-4 text-white/20 group-hover:text-slate-500 transition-colors shrink-0 cursor-grab" />
      <span className="text-xs font-mono text-slate-500 w-6 text-right shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 text-sm text-slate-200 truncate">
        {item.exercise.title}
      </span>
      <button
        onClick={onRemove}
        className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
