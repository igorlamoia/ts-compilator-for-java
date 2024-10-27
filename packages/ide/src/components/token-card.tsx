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

        w-64 shadow-sm  rounded-sm p-4
        cursor-pointer
        ${styles.border} text-${styles.text} ${styles.transform}`}
      onClick={handleTokenClick}
    >
      <p className="text-slate-600">
        <strong>Line: </strong> <span>{token.line}</span>
      </p>
      <p className="text-slate-600">
        <strong>Column: </strong> <span>{token.column}</span>
      </p>
      <p className="text-slate-600">
        <strong>Lexeme: </strong>
        <span className={styles.text}>{token.lexeme}</span>
      </p>
      <p className="text-slate-600">
        <strong>Type: </strong>
        <span className={styles.text}>{token.type}</span>
      </p>
    </div>
  );
}
