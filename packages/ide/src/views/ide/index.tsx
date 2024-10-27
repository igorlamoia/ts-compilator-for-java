import { TToken } from "@/@types/token";
import { MainButton } from "@/components/buttons/main";
import { Editor } from "@/components/editor";
import { useEditor } from "@/hooks/useEditor";
import { api } from "@/utils/axios";
import { useState } from "react";
import { ShowTokens } from "./components/show-tokens";

export function IDEView() {
  const { getEditorCode } = useEditor();
  const [tokens, setTokens] = useState([] as TToken[]);
  const handleRun = async () => {
    const code = getEditorCode();
    const { data } = await api.post("/lexer", { sourceCode: code });
    setTokens(data.tokens);
    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className=" h-[65vh]">
        <Editor />
      </div>
      <MainButton className="ml-auto" onClick={handleRun}>
        Lexical Analysis
      </MainButton>
      <ShowTokens tokens={tokens} />
    </div>
  );
}
