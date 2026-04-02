# Projeto LMS Java-- (Learning Management System)

## Visão Geral
Este projeto é uma plataforma educacional completa (LMS - Learning Management System) projetada para o ensino de lógica de programação utilizando uma versão simplificada da linguagem Java, denominada **Java--**. O ecossistema é composto por três frentes principais:

1.  **IDE (@packages/ide):** Interface web moderna (Next.js) que oferece um editor de código (Monaco Editor) com suporte a realce de sintaxe dinâmico e integração direta com o compilador.
2.  **Backend (@backend):** API robusta (Python/FastAPI) para gestão de usuários, turmas, listas de exercícios e persistência de submissões.
3.  **Compilador (@packages/compiler):** O "coração" técnico do projeto, responsável por transformar o código Java-- em instruções executáveis.

---

## O Compilador (@packages/compiler)

### 🎯 Proposta
A proposta do `@packages/compiler` é fornecer um ambiente de execução seguro, pedagógico e altamente configurável. Diferente de compiladores tradicionais que são rígidos, este foi desenhado para se adaptar ao nível de aprendizado do aluno, permitindo que o instrutor configure regras de gramática (como a obrigatoriedade de ponto-e-vírgula ou o estilo de blocos) para facilitar a transição de iniciantes para linguagens mais complexas.

### 🏗️ Arquitetura do Compilador
O compilador segue um pipeline clássico, mas implementado de forma modular em TypeScript:
-   **Lexer:** Realiza a análise léxica caractere a caractere, gerando tokens. Suporta aliases customizados para operadores e literais booleanos.
-   **Parser (Grammar):** Realiza a análise sintática e semântica de forma descendente recursiva. É aqui que as regras de "Grammar Config" são aplicadas.
-   **IR Emitter:** Gera um Código Intermediário (Instruções de 3 endereços), que abstrai a complexidade da máquina real.
-   **Interpreter:** Um interpretador baseado em pilha e escopos que executa o código intermediário, gerenciando memória e operações de I/O.

### ✅ O que foi feito (Funcionalidades Implementadas)

#### 1. Flexibilidade Gramatical
-   **Modos de Tipagem:** Suporte a modo `typed` (Java-like) e `untyped` (estilo variável dinâmica).
-   **Delimitadores de Bloco:** Suporte a chaves `{}` ou modo por indentação (estilo Python).
-   **Ponto e Vírgula:** Configurável entre obrigatório ou opcional (fim de linha).

#### 2. Estruturas de Dados Avançadas
-   **Arrays e Matrizes:** Implementação de suporte a vetores e matrizes multidimensionais.
    -   **Modo Fixo (C-style):** Tamanho definido na declaração com verificação de limites em tempo de execução.
    -   **Modo Dinâmico (JS-style):** Crescimento automático em escritas indexadas.
-   **Literais de Inicialização:** Suporte a declarações como `int matriz[2][2] = [[1, 2], [3, 4]];`.

#### 3. Tipagem e Semântica
-   **Tipos Suportados:** `int`, `float`, `string`, `bool` e `void`.
-   **Verificação Semântica:** Avisos de conversão com perda de dados (ex: atribuir `float` em `int`) e validação de assinaturas de funções.
-   **Escopo:** Gestão de escopos globais e locais (dentro de funções e blocos).

#### 4. Controle de Fluxo Completo
-   Implementação de `if/else`, `while`, `for`, `switch/case/default`.
-   Suporte a comandos de interrupção: `break` e `continue` com resolução de contexto aninhado.

#### 5. I/O e Sistema
-   **Print:** Suporte a múltiplos argumentos e sequências de escape (`\n`, `\t`).
-   **Scan:** Evoluído para permitir leitura direta em alvos complexos, como `scan(int, matriz[i][j]);`.
-   **Internacionalização (i18n):** Erros e avisos traduzidos para `pt-BR`, `pt-PT`, `en` e `es`.

### 🧪 Qualidade e Testes
O compilador possui uma suíte de testes exaustiva utilizando **Vitest**, cobrindo desde casos de borda no Lexer até a execução de algoritmos complexos no Interpretador, garantindo que novas funcionalidades não quebrem o comportamento existente (regressão).

---
*Este documento reflete o estado atual do projeto em Março de 2026.*
