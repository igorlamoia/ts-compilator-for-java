import { TEditorConfig } from "@/@types/editor";

export const EDITOR_THEMES = ["vs", "vs-dark", "hc-black", "hc-light"];

const DEFAULT_VALUES = {
  theme: EDITOR_THEMES[1],
  language: "java",
};

export class ConfigEntity {
  theme: string;
  language: string;

  constructor(props: TEditorConfig = DEFAULT_VALUES) {
    // get from local storage
    this.theme = props.theme ?? DEFAULT_VALUES.theme;
    this.language = props.language ?? DEFAULT_VALUES.language;
  }
}
