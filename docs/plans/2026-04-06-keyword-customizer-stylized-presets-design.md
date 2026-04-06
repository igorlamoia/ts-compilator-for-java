# Keyword Customizer Stylized Presets Design

**Date:** 2026-04-06

## Goal

Redesenhar os presets estilizados do keyword customizer para que cada linguagem tenha uma unica constante declarativa, sem fragmentos auxiliares espalhados, e para que cada preset estilizado troque todos os lexemas suportados hoje pelo customizador.

## Constraints

- `traditional` e `free` continuam simples e nao entram na regra de trocar todos os lexemas.
- Cada linguagem estilizada deve ser representada por uma unica constante `ALL_CAPS`.
- Nao pode haver constantes derivadas como `MINERES_LIKE_OPERATOR_WORD_MAP`.
- O desenho deve usar apenas os pontos de customizacao que o sistema ja suporta hoje:
  - `mappings`
  - `operatorWordMap`
  - `booleanLiteralMap`
  - `statementTerminatorLexeme`
  - `blockDelimiters`
  - `modes.semicolon`
  - `modes.block`
  - `modes.typing`
  - `modes.array`

## Preset Set

- `traditional`
- `didactic-pt`
- `minimal`
- `python-like`
- `ruby-like`
- `mineres-like`
- `free`

## Preset Model

Cada preset estilizado sera uma unica constante contendo:

- `label`
- `mappings`: todos os keywords suportados pelo wizard
- `operatorWordMap`
- `booleanLiteralMap`
- `statementTerminatorLexeme`
- `blockDelimiters`
- `modes`

O `applyWizardPreset` deve sair de logica fragmentada por `if` e passar a aplicar diretamente os dados da constante do preset. Para os estilizados, nenhum lexema suportado fica herdando o original por omissao.

## Preset Semantics

### Didactic PT

Preset didatico completo em portugues, com blocos por palavras (`inicio` e `fim`) e terminador em portugues. Todo o vocabulário suportado recebe alias em PT-BR simples e legivel.

### Minimal

Preset enxuto, mas ainda completo. Todos os lexemas suportados recebem aliases curtos e consistentes. O objetivo nao e parecer uma linguagem real, e sim minimizar superficie sintatica sem deixar campos sem definicao.

### Python Like

Preset com `modes.block = "indentation"` e `statementTerminatorLexeme = ""`. Mantem a ideia de fluxo proximo de Python, com nomenclatura coerente e sem delimitadores de bloco explicitos. Como o sistema exige cobertura completa, mesmo keywords que poderiam permanecer iguais entram explicitamente no preset.

### Ruby Like

Preset com delimitadores por palavra `inicio` e `fim`, como uma versao simplificada de `begin`/`end`. Mantem semicolon opcional. Todo o vocabulario suportado recebe aliases coerentes com a proposta.

### Mineres Like

Preset regional completo usando o vocabulario dialetal nas partes suportadas pelo sistema: fluxo, IO, tipos, operadores por palavra, booleanos, terminador e estrutura. Tudo fica encapsulado em uma unica constante.

## UI Impact

- O card `creative` sai.
- `python-like` muda a descricao e o snippet para refletir indentacao.
- Entra `ruby-like`.
- Os labels dos presets passam a vir do novo conjunto.

## Testing

- Atualizar `wizard-model.spec.ts` para validar:
  - cada preset estilizado definido por uma unica constante aplicada por dados
  - cobertura de todos os lexemas suportados nos presets estilizados
  - `python-like` com modo indentado
  - `ruby-like` com delimitadores `inicio`/`fim`
- Atualizar testes vizinhos que ainda usam o step antigo `variables`.
