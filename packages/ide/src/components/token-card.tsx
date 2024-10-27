import { TToken, TTokenStyle } from "@/@types/token";
import { useEditor } from "@/hooks/useEditor";

type TokenCardProps = {
  token: TToken;
  styles: TTokenStyle;
};
export function TokenCard({ token, styles }: TokenCardProps) {
  const { showLineAlerts } = useEditor();

  const handleTokenClick = () => {
    showLineAlerts([
      {
        startLineNumber: token.line,
        startColumn: token.column + 1,
        endLineNumber: token.line,
        endColumn: token.column + 1 + token.lexeme.length,
        message: "You have selected this token: " + token.lexeme,
        severity: 2,
      },
    ]);
  };

  return (
    <div
      // put the bg to be opaque
      className={`
        ${styles.bg}
        bg-opacity-80
        relative
        w-64 shadow-sm  rounded-sm p-4
        cursor-pointer
        ${styles.border} text-${styles.text} ${styles.transform}`}
      onClick={handleTokenClick}
    >
      <div className="text-slate-600 grid grid-cols-12 text-sm">
        <div className="col-span-5">
          <strong>Line: </strong> <span>{token.line}</span>
        </div>
        <div
          // absolute top-[-10] left-[108]

          className={`
            col-span-2
            text-center
          rounded-md ${styles.bg} bg-opacity-80 py-0 px-2.5 border border-transparent text-sm text-slate-600 transition-all shadow-sm`}
        >
          <span className={styles.text}>
            <strong>{token.type}</strong>
          </span>
        </div>
        <div className="col-span-5 text-end">
          <strong>Column: </strong> <span>{token.column}</span>
        </div>
      </div>
      <div
        className={`ml-auto rounded-md ${styles.bg} mt-2 bg-opacity-30 py-1 px-2.5 border border-transparent text-sm text-slate-600 transition-all shadow-sm`}
      >
        <strong>Lexeme: </strong>
        <span className={styles.text}>{token.lexeme}</span>
      </div>
    </div>
  );
}
