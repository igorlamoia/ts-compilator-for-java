 1. Gerenciamento de Tarefas (Scrum / Metodologias Ágeis)
   * Backlog Estruturado: Você utilizou o Obsidian (obsidian/tasks/) para manter um backlog de
     funcionalidades, correções de bugs e melhorias futuras ("Plus"), o que demonstra uma
     organização em lista de tarefas (To-Do List) típica de métodos ágeis.
   * Planejamento de Funcionalidades: Existe um diretório docs/plans/ contendo documentos de
     design e implementação datados (ex: 2026-03-09-typing-mode-design.md). Isso indica um
     desenvolvimento baseado em "Design Docs" ou "RFCs", onde a arquitetura é pensada antes da
     codificação, similar ao planejamento de Sprints.
   * Atomicidade: As tarefas são divididas de forma atômica (ex: "Personalizar operadores",
     "Correção automática de exercícios"), o que facilita o acompanhamento do progresso.

  2. Práticas de Teste (TDD / Qualidade)
   * Suíte de Testes Exaustiva: O projeto utiliza Vitest no compilador e Pytest no backend. No
     compilador, os testes cobrem desde a análise léxica (Lexer) até casos complexos no
     Interpretador.
   * Cultura de Testes: O arquivo CLAUDE.md estabelece uma regra rígida: "Ao adicionar novas
     funcionalidades... 6. Adicione casos de teste". Isso reforça uma mentalidade próxima ao
     TDD (Test-Driven Development), onde a verificação automatizada é parte intrínseca do
     fluxo de trabalho.
   * Prevenção de Regressão: Os testes são usados para garantir que novas gramáticas ou
     funcionalidades (como matrizes multidimensionais) não quebrem o código existente.

  3. Arquitetura e Design (Separação de Camadas)
   * Arquitetura de Compiladores Clássica: O compilador é modularizado em estágios bem
     definidos:
       1. Lexer: Análise de caracteres para tokens.
       2. Parser/Grammar: Análise sintática descendente recursiva.
       3. IR Emitter: Geração de código intermediário (3 endereços).
       4. Interpreter: Execução baseada em memória e I/O.
   * Separação de Responsabilidades (Interface vs. Banco de Dados):
       * Frontend (IDE): Desenvolvido em Next.js, focado na experiência do usuário e
         integração com o editor Monaco.
       * Backend (API): Desenvolvido em Python/FastAPI, responsável pela lógica de negócios e
         persistência.
       * Camada de Dados: Uso de Prisma (no IDE para SQLite) e SQLAlchemy/Alembic (no
         backend), isolando as consultas SQL da lógica da aplicação por meio de ORMs e
         Migrations.
   * Padrões de Projeto: Uso explícito do Factory Pattern (no Lexer para criar scanners) e
     Iterator Pattern (para percorrer tokens), demonstrando maturidade no design de software.

  Resumo para resposta:
  > "Sim, o projeto foi desenvolvido seguindo princípios de arquitetura limpa, com uma
  separação clara entre a interface (Next.js/IDE), o motor de execução (Compilador TypeScript)
  e a persistência de dados (API FastAPI com PostgreSQL/SQLite). O gerenciamento de tarefas
  foi feito de forma ágil via Obsidian, com funcionalidades planejadas em documentos de
  design. A qualidade técnica foi assegurada por uma suíte de testes automatizados
  (TDD/Vitest), garantindo que cada nova regra gramatical fosse validada antes da integração
  final."