import { Terminal } from "@/components/ui/terminal";

type ExampleSnippetProps = {
  title: string;
  code: string;
};

export function ExampleSnippet({ title, code }: ExampleSnippetProps) {
  const lines = code.split("\n");

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <Terminal
        sequence={false}
        className="max-w-none overflow-hidden rounded-lg border-slate-200/80 bg-slate-950 text-cyan-100 dark:border-slate-800"
      >
        {lines.map((line, index) => (
          <span
            key={`${index}-${line}`}
            className="font-mono text-xs leading-6"
          >
            {line || " "}
          </span>
        ))}
      </Terminal>
    </section>
  );
}
