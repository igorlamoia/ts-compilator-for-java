export type JavaMMTypingMode = "typed" | "untyped";
export type JavaMMBlockMode = "delimited" | "indentation";
export type JavaMMArrayMode = "fixed" | "dynamic";

export type JavaMMSnippetVariant = {
  body: string;
  description: string;
  labelSuffix?: string;
  typingMode?: JavaMMTypingMode;
  blockMode?: JavaMMBlockMode;
  arrayMode?: JavaMMArrayMode;
};
