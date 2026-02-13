import { TIntermediateCodeData } from "@/pages/api/intermediator";
import { motion } from "motion/react";
// import Instructions3D from "./matrix";

export function ListIntermediateCode({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  if (!instructions) return null;

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-6 font-mono drop-shadow-lg text-foreground">
        Intermediate Code Instructions - Execution Timeline
      </h2>

      <Mixed instructions={instructions} />
      {/* <Instructions3D instructions={instructions} /> */}
    </div>
  );
}

const Mixed = ({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) => {
  return (
    <div className="mt-4">
      {instructions && instructions.length > 0 ? (
        <div className="relative border-l-4 border-cyan-500 ml-6 space-y-10">
          {instructions.map((instruction, index) => (
            <motion.div
              key={index}
              className="relative pl-6 z-0 hover:z-40"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.03 }}
            >
              {/* 🔵 Ponto neon na linha */}
              <span
                className="absolute -left-[11px] top-6 w-5 h-5 bg-cyan-500
                           rounded-full shadow-lg shadow-cyan-400 animate-pulse"
              ></span>

              <div
                className="bg-white/90 text-slate-900 dark:bg-slate-950/80 dark:text-slate-100 border border-cyan-400
                       rounded-xl p-5 shadow-lg shadow-cyan-500/40
                       hover:scale-70 hover:translate-x-4
                       transition-transform duration-300 font-mono"
              >
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
                    {index + 1}. ⚡ {instruction.op}
                  </h3>

                  <p>
                    <span className="text-pink-600 dark:text-pink-400">Result:</span>{" "}
                    {instruction.result ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-green-600 dark:text-green-400">Op1:</span>{" "}
                    {instruction.operand1 ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-yellow-600 dark:text-yellow-400">Op2:</span>{" "}
                    {instruction.operand2 ?? "N/A"}
                  </p>
                  {/* 🔍 Mostrar detalhes ao passar o mouse */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer group">
                    🔍 Show Line
                    <div
                      className="absolute hidden group-hover:block bg-white dark:bg-slate-900
                        text-slate-900 dark:text-white border border-cyan-300 rounded-lg
                        shadow-lg p-2 mt-1 z-50 w-72 right-8"
                    >
                      <ul className="space-y-1 text-xs">
                        {Object.entries(instruction).map(([key, value]) => (
                          <li key={key} className="flex gap-2">
                            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                              {key}:
                            </span>
                            <span className="break-all">
                              {value === null || value === undefined
                                ? "N/A"
                                : String(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No intermediate code instructions available.
        </p>
      )}
    </div>
  );
};
