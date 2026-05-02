import { useEffect, useState } from "react";
import type { WizardPreview } from "../preview-data";
import { ExampleSnippet } from "../example-snippet";

import { CardSnapStack } from "./card-snap-stack";
import { CategorySection } from "./category-section";
import { PREVIEW_CATEGORIES, PreviewCategory } from "./categories-list";

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

function formatPreviewCategoryLabel(title: string): string {
  return title
    .toLowerCase()
    .replace(/(^|[\s/])([a-z])/g, (_, separator: string, char: string) => {
      return `${separator}${char.toUpperCase()}`;
    })
    .replace(/\sE\s/g, " e ");
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const groupedLexemes = segregateLexemeChangesByCategory(preview);
  const cardItems = groupedLexemes.map((category) => {
    const { key, title, icon, subtitle, items, changedCount, percentage } =
      category;

    return {
      key,
      label: formatPreviewCategoryLabel(title),
      icon,
      children: (
        <CategorySection
          title={title}
          subtitle={subtitle}
          icon={icon}
          items={items}
          changedCount={changedCount}
          percentage={percentage}
        />
      ),
    };
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside
      data-preview-panel
      className={`max-lg:h-[calc(100dvh-1rem)] lg:fixed lg:right-0 self-start pl-2 overflow-hidden lg:w-90 transition-[top,height] duration-300 ease-out ${
        isScrolled
          ? "lg:top-0 lg:h-screen"
          : "lg:top-18 lg:h-[calc(100vh-4rem)]"
      }`}
    >
      <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-lg py-4 pr-4 lg:overflow-y-auto">
        <ExampleSnippet title="Preview do código" code={preview.snippet} />

        <CardSnapStack items={cardItems} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#090f1bcc] via-[#090f1b66] to-transparent" />
      </div>
    </aside>
  );
}
