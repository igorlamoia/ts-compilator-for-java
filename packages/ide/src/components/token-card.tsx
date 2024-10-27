import { TToken, TTokenStyle } from "@/@types/token";

type TokenCardProps = {
  token: TToken;
  styles: TTokenStyle;
};
export function TokenCard({ token, styles }: TokenCardProps) {
  return (
    <div
      // put the bg to be opaque
      className={`
        ${styles.bg}
        bg-opacity-80

        w-64 shadow-sm  rounded-sm p-4

        ${styles.border} text-${styles.text} ${styles.transform}`}
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
