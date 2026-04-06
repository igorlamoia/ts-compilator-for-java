# Keyword Customizer Preview Categories Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agrupar o “Resumo parcial” do preview panel por categorias semânticas da linguagem em vez de renderizar apenas uma sequência linear de chips.

**Architecture:** Manter `chosenLexemes` como está em `preview-data.ts` e fazer o agrupamento localmente em `preview-panel.tsx`, reaproveitando a taxonomia semântica que já existe no componente para cores e bordas.

**Tech Stack:** TypeScript, React, Vitest, jsdom

---

### Task 1: Especificar o agrupamento do resumo em testes

**Files:**
- Create: `packages/ide/src/components/keyword-customizer/preview-panel.spec.tsx`

**Step 1: Write the failing test**

Adicionar teste cobrindo:
- agrupamento por categorias semânticas
- ordem estável das categorias
- ocultação de categorias vazias

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/preview-panel.spec.tsx`
Expected: FAIL because the panel ainda renderiza uma lista única de chips.

**Step 3: Write minimal implementation**

Atualizar o painel para renderizar seções por categoria.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/preview-panel.spec.tsx`
Expected: PASS

### Task 2: Implementar o agrupamento no painel

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/preview-panel.tsx`

**Step 1: Write the failing test**

Usar a cobertura da Task 1 como contrato.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/keyword-customizer/preview-panel.spec.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

Agrupar `preview.chosenLexemes` em categorias semânticas e renderizar apenas grupos com conteúdo.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/keyword-customizer/preview-panel.spec.tsx`
Expected: PASS

### Task 3: Verificação direcionada

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run: `npx vitest run src/components/keyword-customizer/preview-panel.spec.tsx src/components/keyword-customizer/preview-data.spec.ts`
Expected: PASS
