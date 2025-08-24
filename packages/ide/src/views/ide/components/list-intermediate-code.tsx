import { TIntermediateCodeData } from "@/pages/api/intermediator";

export function ListIntermediateCode({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  if (!instructions) return null;

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-2">
        Intermediate Code Instructions
      </h2>
      {instructions && instructions.length > 0 ? (
        <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
          {instructions.map((instruction, index) => (
            <li key={index} className="mb-1 flex gap-1 justify-between">
              <div>
                <p>Operation: {instruction.op}</p>
              </div>
              <div>
                <p>
                  Result:
                  {instruction.result !== undefined
                    ? instruction.result
                    : "N/A"}
                </p>
              </div>
              <div>
                <p>
                  First Operand:{" "}
                  {instruction.operand1 !== undefined
                    ? instruction.operand1
                    : "N/A"}
                </p>
              </div>
              <div>
                <p>
                  Second Operand:{" "}
                  {instruction.operand2 !== undefined
                    ? instruction.operand2
                    : "N/A"}
                </p>
              </div>
              <div className="relative group inline-block">
                <p>Show Line</p>
                <div className="absolute left-[-100px] z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-2 mt-1 min-w-max">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(instruction, null, 2)}
                  </pre>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No intermediate code instructions available.</p>
      )}
    </div>
  );
}
