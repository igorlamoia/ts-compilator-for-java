import { TIntermediateCodeData } from "@/pages/api/intermediator";
import { useRef } from "react";
// import Instructions3D from "./matrix";

export function ListIntermediateCode({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  if (!instructions) return null;

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-6 font-mono drop-shadow-lg">
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) {
    audioRef.current = new Audio("/sounds/beep.mp3"); // coloque seu arquivo em /public/sounds/
  }
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // sempre do começo
      audioRef.current.play();
    }
  };
  return (
    <div className="mt-4">
      {instructions && instructions.length > 0 ? (
        <div className="relative border-l-4 border-cyan-500 ml-6 space-y-10">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="relative pl-6 "
              onMouseEnter={playSound}
            >
              {/* 🔵 Ponto neon na linha */}
              <span
                className="absolute -left-[11px] top-6 w-5 h-5 bg-cyan-500
                           rounded-full shadow-lg shadow-cyan-400 animate-pulse"
              ></span>

              <div
                className="bg-black bg-opacity-80 border border-cyan-400
                       rounded-xl p-5 shadow-lg shadow-cyan-500/40
                       hover:scale-70 hover:translate-x-4
                       transition-transform duration-300 font-mono"
              >
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <h3 className="text-xl font-bold  text-cyan-300">
                    {index + 1}. ⚡ {instruction.op}
                  </h3>

                  <p>
                    <span className="text-pink-400">Result:</span>{" "}
                    {instruction.result ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-green-400">Op1:</span>{" "}
                    {instruction.operand1 ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-yellow-400">Op2:</span>{" "}
                    {instruction.operand2 ?? "N/A"}
                  </p>
                  {/* 🔍 Mostrar detalhes ao passar o mouse */}
                  <div className="text-xs text-gray-400 hover:text-white cursor-pointer group">
                    🔍 Show Line
                    <div
                      className="absolute hidden group-hover:block bg-gray-900
                        text-white border border-cyan-300 rounded-lg
                        shadow-lg p-2 mt-1 z-10 w-72 right-8"
                    >
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(instruction, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">
          No intermediate code instructions available.
        </p>
      )}
    </div>
  );
};
