import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { TextPressure } from "@/components/TextPressure";

export type VariableStepKeyword =
  | "print"
  | "scan"
  | "int"
  | "float"
  | "bool"
  | "string"
  | "variavel";

export type VariablesStepProps = {
  values: {
    snippet?: string;
    typingMode: StoredKeywordCustomization["modes"]["typing"];
    arrayMode: StoredKeywordCustomization["modes"]["array"];
    printKeyword: string;
    printDescription: string;
    scanKeyword: string;
    scanDescription: string;
    typingBeamKeywords: {
      variavel: string;
      string: string;
      float: string;
      int: string;
      void: string;
    };
    variableKeywords: Array<{
      key: Exclude<VariableStepKeyword, "print" | "scan">;
      value: string;
      description: string;
    }>;
  };
  actions: {
    syncTypingMode: (mode: "typed" | "untyped") => void;
    syncArrayMode: (mode: "fixed" | "dynamic") => void;
    syncKeyword: (original: VariableStepKeyword, value: string) => void;
    syncKeywordDescription: (
      original: VariableStepKeyword,
      value: string,
    ) => void;
  };
};

export function IOStep({ values, actions }: VariablesStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Etapa 2
        </p>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          I/O Entrada e saída
        </h3>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Antes de criar regras complexas, sua linguagem precisa aprender a
          falar. Toda linguagem começa com uma primeira mensagem, famoso{" "}
          <strong>Hello World</strong>, ou melhor:
        </p>
      </header>

      <div style={{ position: "relative", height: "200px" }}>
        <TextPressure
          text="Olá Mundo!"
          flex
          alpha={false}
          stroke={false}
          width
          weight
          italic
          textColor="#ffffff"
          strokeColor="#5227FF"
          minFontSize={36}
        />
      </div>
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        Como os programadores vão imprimir mensagens na tela? E como vão ler
        aquilo que o usuário digitar?
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <DocumentedField
          label="Palavra de saída"
          value={values.printKeyword}
          description={values.printDescription}
          onValueChange={(value) => actions.syncKeyword("print", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("print", value)
          }
        />

        <DocumentedField
          label="Palavra de leitura"
          value={values.scanKeyword}
          description={values.scanDescription}
          onValueChange={(value) => actions.syncKeyword("scan", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("scan", value)
          }
        />
      </div>

      <ExampleSnippet
        title="Exemplo ao vivo"
        code={values.snippet ?? `${values.printKeyword}("Ola mundo")`}
        output={["Ola mundo"]}
      />
    </section>
  );
}
