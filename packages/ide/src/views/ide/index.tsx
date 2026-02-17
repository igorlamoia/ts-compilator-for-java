import { ShowTokens } from "./components/show-tokens";
import { useLexerAnalyse } from "./useLexerAnalyse";
import { ListIntermediateCode } from "./components/list-intermediate-code";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import { TToken } from "@/@types/token";
import { useState } from "react";
import { Menu } from "./components/menu";
import { SideExplorer } from "./components/side-explorer";
import { SideMenu } from "./components/side-menu";
import { useTerminalContext } from "@/pages";
import { MainSection } from "./components/main-section";
import { BorderBeam } from "@/components/ui/border-beam";
import { useKeyboardShortcuts } from "@/components/terminal/useKeyboardShortcuts";
import { AnimatePresence, motion } from "motion/react";

export function IDEView({
  handleIntermediateCodeGeneration,
  intermediateCode,
}: {
  handleIntermediateCodeGeneration: (tokens: TToken[]) => Promise<boolean>;
  intermediateCode: { instructions: Instruction[] };
}) {
  const { handleRun, analyseData } = useLexerAnalyse();
  const { isTerminalOpen, setIsTerminalOpen } = useTerminalContext();

  const [activeFile, setActiveFile] = useState("src/main.?");
  const [openTabs, setOpenTabs] = useState<string[]>([
    "src/main.?",
    "src/grammar/stmt.?",
  ]);

  const runAll = async () => {
    const tokens = await handleRun();
    if (!tokens) return;
    const isIntermediateGenerated =
      await handleIntermediateCodeGeneration(tokens);
    if (!isIntermediateGenerated) return;
    setIsTerminalOpen(true);
  };

  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);
  useKeyboardShortcuts(toggleTerminal, isTerminalOpen, setIsExplorerOpen);

  return (
    <>
      <div className="relative rounded-2xl">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
          <Menu handleRun={handleRun} runAll={runAll} />
          <div className={`flex h-[70vh]`}>
            <AnimatePresence>
              <div className={`flex flex-1 flex-col sm:flex-row h-full w-full`}>
                <SideMenu
                  isExplorerOpen={isExplorerOpen}
                  setIsExplorerOpen={setIsExplorerOpen}
                />
                {isExplorerOpen && (
                  <motion.div
                    initial={{ x: "-5%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col border-r border-white/10 sm:w-70"
                    transition={{
                      type: "spring",
                      damping: 20,
                      duration: 0.8,
                      stiffness: 300,
                    }}
                  >
                    <SideExplorer
                      activeFile={activeFile}
                      setActiveFile={setActiveFile}
                      setOpenTabs={setOpenTabs}
                    />
                  </motion.div>
                )}
                <MainSection
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  openTabs={openTabs}
                  setOpenTabs={setOpenTabs}
                  isTerminalOpen={isTerminalOpen}
                  toggleTerminal={toggleTerminal}
                  intermediateCode={intermediateCode}
                />
              </div>
            </AnimatePresence>
          </div>
        </div>

        <BorderBeam
          duration={8}
          size={100}
          colorFrom="var(--color-primary)"
          colorTo="var(--color-slate-600)"
        />
        {/* <BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-(--color-primary) to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        borderWidth={2}
        className="from-transparent via-slate-600 to-transparent"
      /> */}
      </div>
      <div className="flex flex-col gap-4 ">
        <ShowTokens analyseData={analyseData} />
        <div className="flex flex-col gap-2">
          <ListIntermediateCode instructions={intermediateCode.instructions} />
        </div>
      </div>
    </>
  );
}
