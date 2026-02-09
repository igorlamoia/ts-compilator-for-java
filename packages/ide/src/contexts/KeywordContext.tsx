import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useEditor } from "@/hooks/useEditor";
import { updateJavaMMKeywords } from "@/utils/compiler/editor/java-mm-language";

/** As 11 keywords editáveis com seus IDs numéricos de token */
const CUSTOMIZABLE_KEYWORDS: Record<string, number> = {
    int: 21,
    float: 22,
    string: 23,
    void: 49,
    for: 24,
    while: 25,
    break: 26,
    continue: 27,
    if: 28,
    else: 29,
    return: 30,
};

/** Keywords fixas de I/O que não são customizáveis */
const FIXED_KEYWORDS: Record<string, number> = {
    system: 31,
    out: 32,
    print: 33,
    in: 34,
    scan: 35,
};

/** Lista ordenada das palavras originais customizáveis (para exibir no modal) */
export const ORIGINAL_KEYWORDS = Object.keys(CUSTOMIZABLE_KEYWORDS);

export type KeywordMapping = {
    original: string;
    custom: string;
    tokenId: number;
};

type KeywordContextType = {
    /** Mapeamentos atuais (original → custom) */
    mappings: KeywordMapping[];
    /** Atualiza a palavra customizada de uma keyword original */
    updateKeyword: (original: string, custom: string) => void;
    /** Restaura todos os mapeamentos para os valores padrão */
    resetKeywords: () => void;
    /** Retorna o keywordMap final (custom word → token ID) para enviar ao Lexer */
    buildKeywordMap: () => Record<string, number>;
    /** Valida se uma palavra customizada é válida */
    validateKeyword: (original: string, custom: string) => string | null;
};

const KeywordContext = createContext<KeywordContextType>(
    {} as KeywordContextType
);

export function useKeywords() {
    return useContext(KeywordContext);
}

const STORAGE_KEY = "java--keyword-mappings";

function getDefaultMappings(): KeywordMapping[] {
    return ORIGINAL_KEYWORDS.map((word) => ({
        original: word,
        custom: word,
        tokenId: CUSTOMIZABLE_KEYWORDS[word],
    }));
}

function loadMappings(): KeywordMapping[] {
    if (typeof window === "undefined") return getDefaultMappings();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return getDefaultMappings();
        const parsed = JSON.parse(stored) as KeywordMapping[];
        // Validar que contém todas as keywords esperadas
        if (
            parsed.length !== ORIGINAL_KEYWORDS.length ||
            !ORIGINAL_KEYWORDS.every((kw) => parsed.some((m) => m.original === kw))
        ) {
            return getDefaultMappings();
        }
        return parsed;
    } catch {
        return getDefaultMappings();
    }
}

export function KeywordProvider({ children }: { children: ReactNode }) {
    const [mappings, setMappings] = useState<KeywordMapping[]>(getDefaultMappings);
    const { monacoRef, retokenize } = useEditor();

    // Carregar do localStorage após montar no client
    useEffect(() => {
        setMappings(loadMappings());
    }, []);

    // Persistir no localStorage quando mudar
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
        }
    }, [mappings]);

    // Atualizar syntax highlighting do Monaco quando as keywords mudarem
    useEffect(() => {
        if (monacoRef.current) {
            const customWords = mappings.map((m: KeywordMapping) => m.custom).filter(Boolean);
            updateJavaMMKeywords(monacoRef.current, customWords);
            retokenize();
        }
    }, [mappings, monacoRef, retokenize]);

    const validateKeyword = useCallback(
        (original: string, custom: string): string | null => {
            if (!custom.trim()) return "A palavra não pode ser vazia.";
            if (!/^[a-zA-Z]+$/.test(custom))
                return "Use apenas letras (sem números, espaços ou símbolos).";

            // Verificar se a palavra customizada já está sendo usada por outra keyword
            const conflict = mappings.find(
                (m: KeywordMapping) => m.original !== original && m.custom === custom
            );
            if (conflict)
                return `"${custom}" já está sendo usada para "${conflict.original}".`;

            // Verificar se conflita com keywords fixas de I/O
            if (custom in FIXED_KEYWORDS)
                return `"${custom}" é uma palavra reservada do sistema (I/O).`;

            return null; // válido
        },
        [mappings]
    );

    const updateKeyword = useCallback(
        (original: string, custom: string) => {
            setMappings((prev: KeywordMapping[]) =>
                prev.map((m: KeywordMapping) => (m.original === original ? { ...m, custom } : m))
            );
        },
        []
    );

    const resetKeywords = useCallback(() => {
        setMappings(getDefaultMappings());
    }, []);

    const buildKeywordMap = useCallback((): Record<string, number> => {
        const map: Record<string, number> = { ...FIXED_KEYWORDS };
        for (const m of mappings) {
            map[m.custom] = m.tokenId;
        }
        return map;
    }, [mappings]);

    return (
        <KeywordContext.Provider
            value={{
                mappings,
                updateKeyword,
                resetKeywords,
                buildKeywordMap,
                validateKeyword,
            }}
        >
            {children}
        </KeywordContext.Provider>
    );
}
