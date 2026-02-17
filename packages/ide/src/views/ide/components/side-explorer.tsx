import {
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useMemo, useState } from "react";

type TreeNode = {
  type: "folder" | "file";
  name: string;
  path: string;
  children?: TreeNode[];
};

interface SideExplorerProps {
  activeFile: string;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SideExplorer({
  activeFile,
  setActiveFile,
  setOpenTabs,
}: SideExplorerProps) {
  const [openFolders, setOpenFolders] = useState<string[]>([
    "src",
    "src/grammar",
  ]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const openFile = (path: string) => {
    setActiveFile(path);
    setOpenTabs((prev: string[]) =>
      prev.includes(path) ? prev : [...prev, path],
    );
  };

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      if (node.type === "folder") {
        const isOpen = openFolders.includes(node.path);
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleFolder(node.path)}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:text-foreground"
              style={{ paddingLeft: depth * 12 + 8 }}
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${
                  isOpen ? "rotate-90" : "rotate-0"
                }`}
              />
              {isOpen ? (
                <FolderOpen className="h-3.5 w-3.5 text-cyan-300" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-cyan-300" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isOpen && node.children && (
              <div className="mt-0.5">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => openFile(node.path)}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors ${
            activeFile === node.path
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ paddingLeft: depth * 12 + 24 }}
        >
          {node.name.endsWith(".md") ? (
            <FileText className="h-3.5 w-3.5 text-amber-300" />
          ) : (
            <FileCode2 className="h-3.5 w-3.5 text-emerald-300" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      );
    });

  const tree = useMemo<TreeNode[]>(
    () => [
      {
        type: "folder",
        name: "src",
        path: "src",
        children: [
          {
            type: "file",
            name: "main.?",
            path: "src/main.?",
          },
          {
            type: "folder",
            name: "grammar",
            path: "src/grammar",
            children: [
              {
                type: "file",
                name: "stmt.?",
                path: "src/grammar/stmt.?",
              },
              {
                type: "file",
                name: "expr.?",
                path: "src/grammar/expr.?",
              },
              {
                type: "file",
                name: "token.?",
                path: "src/grammar/token.?",
              },
            ],
          },
          {
            type: "folder",
            name: "ir",
            path: "src/ir",
            children: [
              { type: "file", name: "emitter.ts", path: "src/ir/emitter.ts" },
              {
                type: "file",
                name: "interpreter.ts",
                path: "src/ir/interpreter.ts",
              },
            ],
          },
        ],
      },
      {
        type: "folder",
        name: "tests",
        path: "tests",
        children: [
          {
            type: "file",
            name: "lexer.spec.ts",
            path: "tests/lexer.spec.ts",
          },
        ],
      },
      { type: "file", name: "README.md", path: "README.md" },
    ],
    [],
  );

  return (
    <>
      <div className="flex items-center justify-between px-3 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Explorer
        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px]">
          Java--
        </span>
      </div>
      <div className="flex-1 overflow-auto px-2 pb-4">{renderTree(tree)}</div>
    </>
  );
}
