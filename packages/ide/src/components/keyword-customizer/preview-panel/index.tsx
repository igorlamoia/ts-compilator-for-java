import type { WizardPreview } from "../preview-data";
import { ExampleSnippet } from "../example-snippet";

import { CategorySection } from "./category-section";
import { PREVIEW_CATEGORIES, PreviewCategory } from "./categories-list";
import { ScrollStack, ScrollStackItem } from "@/components/ui/scroll-stack";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";

export type PreviewPanelProps = {
  preview: WizardPreview;
};

export type CategoryTone = {
  chip: string;
  progress: string;
  progressTrack: string;
  borderChanged: string;
  textChanged: string;
  line: string;
};

export type CategoryLexemeItem = {
  original: string;
  custom: string;
  isChanged: boolean;
};

type GroupedCategory = PreviewCategory & {
  items: CategoryLexemeItem[];
  changedCount: number;
  percentage: number;
};

function buildLexemeChangeMap(preview: WizardPreview): Map<string, string> {
  return new Map(
    preview.chosenLexemes.map((item) => [item.original, item.custom]),
  );
}

function buildCategoryItems(
  category: PreviewCategory,
  changedMap: Map<string, string>,
): CategoryLexemeItem[] {
  return category.lexemes.map((original) => {
    const changed = changedMap.get(original);

    return {
      original,
      custom: changed ?? original,
      isChanged: Boolean(changed && changed !== original),
    };
  });
}

function segregateLexemeChangesByCategory(
  preview: WizardPreview,
): GroupedCategory[] {
  const changedMap = buildLexemeChangeMap(preview);

  return PREVIEW_CATEGORIES.map((category) => {
    const items = buildCategoryItems(category, changedMap);
    const changedCount = items.filter((item) => item.isChanged).length;
    const percentage =
      items.length > 0 ? Math.round((changedCount / items.length) * 100) : 0;

    return {
      ...category,
      items,
      changedCount,
      percentage,
    };
  });
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
  const groupedLexemes = segregateLexemeChangesByCategory(preview);

  return (
    <aside className="sticky top-0 pl-2 self-start ">
      <div className="relative rounded-lg flex h-[calc(100vh-10rem)] flex-col gap-6 overflow-hidden">
        <ExampleSnippet title="Preview do código" code={preview.snippet} />

        <PerfectScrollbar>
          <ScrollStack
            stackPosition="0%"
            scaleEndPosition="0%"
            itemDistance={10}
            itemStackDistance={30}
            blurAmount={0.5}
          >
            {groupedLexemes.map((category) => (
              <ScrollStackItem key={category.key}>
                <CategorySection {...category} />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </PerfectScrollbar>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#090f1bcc] via-[#090f1b66] to-transparent" />
      </div>
    </aside>
  );
}
