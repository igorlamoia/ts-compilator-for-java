import { TEditorConfig } from "@/@types/editor";

const DEFAULT_VALUES = {
  theme: "vs-dark",
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
