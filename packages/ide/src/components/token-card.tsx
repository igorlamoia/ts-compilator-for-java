import { TToken, TTokenStyle } from "@/@types/token";

type TokenCardProps = {
  token: TToken;
  styles: TTokenStyle;
};
export function TokenCard({ token, styles }: TokenCardProps) {
  return (
    <div
      className={`w-80 shadow-sm  rounded-sm p-2 ${styles.bg} ${styles.border} ${styles.text} ${styles.transform}`}
    >
      <p>
        <strong> Line:</strong> <span>{token.line}</span>
      </p>
      <p>
        <strong> Column:</strong> <span>{token.column}</span>
      </p>
      <p>
        <strong> Lexeme:</strong> <span>{token.lexeme}</span>
      </p>
      <p>
        <strong> Type:</strong>
        <span className={styles.text}>{token.type}</span>
      </p>
    </div>
  );
}
