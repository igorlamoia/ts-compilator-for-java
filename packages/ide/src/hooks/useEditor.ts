import { EditorContext } from "@/contexts/EditorContext";
import { useContext } from "react";

// Custom hook for accessing EditorContext
export const useEditor = () => useContext(EditorContext);
