type ExampleSnippetProps = {
  title: string;
  code: string;
};

export function ExampleSnippet({ title, code }: ExampleSnippetProps) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <pre className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-cyan-100 dark:border-slate-800">
        <code>{code}</code>
      </pre>
    </section>
  );
}
