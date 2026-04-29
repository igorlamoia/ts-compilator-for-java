import { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { MoveRight } from "lucide-react";
import { ChangedChip } from "../../changed-chip";

type TypingRelationshipBeamProps = {
  typingMode: "typed" | "untyped";
  labels: {
    variavel: string;
    string: string;
    float: string;
    int: string;
    void: string;
  };
};

function formatNodeLabel(original: string, changed: string): string {
  return changed || original;
}

function TypingBeamChip({
  original,
  changed,
  active,
  chipRef,
  className,
}: {
  original: string;
  changed: string;
  active: boolean;
  chipRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <div ref={chipRef}>
      <ChangedChip
        className={className}
        original={original}
        changed={changed}
        active={active}
        originalClassName="text-slate-700 dark:text-slate-300"
        separator={<MoveRight className="h-3 w-3" />}
        changedClassName="font-bold"
      />
    </div>
  );
}

export function TypingRelationshipBeam({
  typingMode,
  labels,
}: TypingRelationshipBeamProps) {
  const beamContainerRef = useRef<HTMLDivElement>(null);
  const untypedRef = useRef<HTMLDivElement>(null);
  const stringRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const intRef = useRef<HTMLDivElement>(null);
  const voidRef = useRef<HTMLDivElement>(null);

  const isTyped = typingMode === "typed";

  return (
    <div
      ref={beamContainerRef}
      className="relative overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50/60 px-4 py-5 dark:border-slate-800/80 dark:bg-slate-900/50"
    >
      <div className="relative z-10 flex min-h-52.5 items-center justify-between gap-8">
        <div className="flex shrink-0 items-center">
          <TypingBeamChip
            chipRef={untypedRef}
            original="variavel"
            changed={formatNodeLabel("variavel", labels.variavel)}
            active={!isTyped}
          />
        </div>

        <div className="flex flex-col  items-end gap-4">
          <TypingBeamChip
            chipRef={stringRef}
            original="string"
            changed={formatNodeLabel("string", labels.string)}
            active={isTyped}
          />
          <TypingBeamChip
            chipRef={floatRef}
            original="float"
            changed={formatNodeLabel("float", labels.float)}
            active={isTyped}
          />
          <TypingBeamChip
            chipRef={intRef}
            original="int"
            changed={formatNodeLabel("int", labels.int)}
            active={isTyped}
          />
          <TypingBeamChip
            chipRef={voidRef}
            original="void"
            changed={formatNodeLabel("void", labels.void)}
            active={isTyped}
          />
        </div>
      </div>

      <AnimatedBeam
        containerRef={beamContainerRef}
        fromRef={untypedRef}
        toRef={stringRef}
        fromAnchor="right"
        toAnchor="left"
        reverse={!isTyped}
        pathOpacity={0.22}
        duration={5}
      />
      <AnimatedBeam
        containerRef={beamContainerRef}
        fromRef={untypedRef}
        toRef={floatRef}
        fromAnchor="right"
        toAnchor="left"
        reverse={!isTyped}
        pathOpacity={0.22}
        duration={5}
        delay={0.2}
      />
      <AnimatedBeam
        containerRef={beamContainerRef}
        fromRef={untypedRef}
        toRef={intRef}
        fromAnchor="right"
        toAnchor="left"
        reverse={!isTyped}
        pathOpacity={0.22}
        duration={5}
        delay={0.4}
      />
      <AnimatedBeam
        containerRef={beamContainerRef}
        fromRef={untypedRef}
        toRef={voidRef}
        fromAnchor="right"
        toAnchor="left"
        reverse={!isTyped}
        pathOpacity={0.22}
        duration={5}
        delay={0.6}
      />
    </div>
  );
}
