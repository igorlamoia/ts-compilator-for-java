import { TokenCard } from "@/components/token-card";
import { Marquee } from "@/components/ui/marquee";
import { TToken, TTokenStyle } from "@/@types/token";

type TTest = {
  allFormattedTokens: {
    token: TToken;
    info: {
      styles: TTokenStyle;
    };
  }[];
};

export function CardsPreview({ allFormattedTokens }: TTest) {
  return (
    <div
      className="[--duration:25s] relative flex w-full flex-col items-center justify-center overflow-hidden py-6"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        WebkitMaskComposite: "source-in",
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div>
        <Marquee pauseOnHover repeat={3} className="[--duration:25s]">
          {allFormattedTokens.slice(0, 3).map(({ token, info }) => (
            <div
              key={token.line + "c" + token.column + "marquee1"}
              className="mx-2 min-w-64"
            >
              <TokenCard token={token} styles={info.styles} />
            </div>
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse repeat={3} className="[--duration:30s]">
          {allFormattedTokens.slice(3, 6).map(({ token, info: { styles } }) => (
            <div
              key={token.line + "c" + token.column + "marquee2"}
              className="mx-2 min-w-64"
            >
              <TokenCard token={token} styles={styles} />
            </div>
          ))}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-neutral-50 dark:from-neutral-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-neutral-50 dark:from-neutral-950" />
    </div>
  );
}
