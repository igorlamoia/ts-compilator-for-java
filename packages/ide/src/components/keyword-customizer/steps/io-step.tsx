import { ExampleSnippet } from "../example-snippet";
import { DocumentedField } from "../documented-field";
import { HyperText } from "@/components/ui/hyper-text";
import { Terminal } from "lucide-react";
import { Step } from "./components/step";

export type IOKeyword = "print" | "scan";

export type IOStepProps = {
  values: {
    snippet?: string;
    printKeyword: string;
    printDescription: string;
    scanKeyword: string;
    scanDescription: string;
  };
  actions: {
    syncKeyword: (original: IOKeyword, value: string) => void;
    syncKeywordDescription: (original: IOKeyword, value: string) => void;
  };
};

export function IOStep({ values, actions }: IOStepProps) {
  return (
    <section className="space-y-6">
      <Step.Header>
        <Step.Index>Etapa 2</Step.Index>
        <Step.Title>I/O Entrada e saída</Step.Title>
        <Step.Description>
          Antes de criar regras complexas, sua linguagem precisa aprender a
          falar. Toda linguagem começa com uma primeira mensagem, famoso{" "}
          <strong>Hello World</strong>, ou melhor:{" "}
          <HyperText
            as="span"
            className="text-sm text-slate-900 dark:text-slate-100"
          >
            Olá Mundo!
          </HyperText>
        </Step.Description>
      </Step.Header>

      <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
        Como os programadores vão imprimir mensagens na tela? E como vão ler
        aquilo que o usuário digitar?
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <DocumentedField
          label="Capturar entrada"
          value={values.scanKeyword}
          description={values.scanDescription}
          onValueChange={(value) => actions.syncKeyword("scan", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("scan", value)
          }
          icon={{
            icon: <Terminal />,
            color: "emerald",
          }}
        />
        <DocumentedField
          label="Exibir saída"
          value={values.printKeyword}
          description={values.printDescription}
          onValueChange={(value) => actions.syncKeyword("print", value)}
          onDescriptionChange={(value) =>
            actions.syncKeywordDescription("print", value)
          }
          icon={{
            icon: <Terminal />,
            color: "rose",
          }}
        />
      </div>

      <ExampleSnippet
        title="Exemplo ao vivo"
        code={values.snippet ?? `${values.printKeyword}("Ola mundo")`}
        input={["Kiki"]}
        output={["Ola mundo", "Me chamo: Kiki"]}
      />
    </section>
  );
}
