# Keyword Customizer Stylized Presets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reestruturar os presets estilizados do keyword customizer para usar uma unica constante por linguagem, cobrir todos os lexemas suportados e introduzir `ruby-like` enquanto `python-like` passa a ser indentado.

**Architecture:** Concentrar toda a definicao dos presets em `wizard-model.ts`, com uma constante por linguagem estilizada contendo todos os campos configuraveis. Aplicar os presets por dados e alinhar a UI e os testes com os novos ids e modos.

**Tech Stack:** TypeScript, React, Vitest

---

### Task 1: Especificar os novos presets em testes

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.spec.ts`
- Modify: `packages/ide/src/components/keyword-customizer/preview-data.spec.ts`

**Step 1: Write the failing test**

Adicionar testes para:
- `python-like` com `modes.block = "indentation"` e cobertura explicita dos lexemas suportados
- `ruby-like` com `blockDelimiters = { open: "inicio", close: "fim" }`
- `mineres-like`, `didactic-pt` e `minimal` cobrindo todos os lexemas suportados
- labels atualizados do conjunto de presets

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts src/components/keyword-customizer/preview-data.spec.ts`
Expected: FAIL because the preset model and preset ids still do not match the new contract.

**Step 3: Write minimal implementation**

Atualizar o modelo e a UI apenas no necessario para satisfazer a nova cobertura.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts src/components/keyword-customizer/preview-data.spec.ts`
Expected: PASS

### Task 2: Reestruturar o wizard model

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.ts`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-context.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-validation.ts`

**Step 1: Write the failing test**

Usar a cobertura de Task 1 como contrato do novo comportamento.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts src/components/keyword-customizer/preview-data.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implementar:
- uma unica constante por linguagem estilizada
- novo preset `ruby-like`
- `python-like` indentado
- aplicacao declarativa do preset inteiro, inclusive `modes`

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts src/components/keyword-customizer/preview-data.spec.ts`
Expected: PASS

### Task 3: Atualizar os cards da etapa de identidade

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/steps/identity-step.tsx`

**Step 1: Write the failing test**

Confiar na cobertura por type-checking e nos testes do wizard model para acusar ids invalidos.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts`
Expected: FAIL until the new preset ids and snippets are reflected in the UI metadata.

**Step 3: Write minimal implementation**

Substituir a configuracao visual dos cards para refletir `python-like`, `ruby-like` e `mineres-like`.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts`
Expected: PASS

### Task 4: Verificar regressao local

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run: `npx vitest run src/components/keyword-customizer/wizard-model.spec.ts src/components/keyword-customizer/preview-data.spec.ts`
Expected: PASS

**Step 2: Run type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors from the files touched in this task; existing unrelated package errors may remain.
