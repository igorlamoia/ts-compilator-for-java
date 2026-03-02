export type HeadingLevel =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span";

export const variantStyles: Record<HeadingLevel, string> = {
  h1: "text-5xl font-black tracking-tight",
  h2: "text-4xl font-black tracking-tight",
  h3: "text-3xl font-bold tracking-tight",
  h4: "text-2xl font-bold",
  h5: "text-xl font-bold",
  h6: "text-lg font-bold",
  p: "text-base leading-relaxed",
  span: "text-base leading-relaxed",
};
