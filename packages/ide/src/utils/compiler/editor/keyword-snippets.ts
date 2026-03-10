import { JavaMMSnippetVariant } from "./types";

/**
 * Snippet bodies keyed by original keyword.
 * Uses Monaco snippet syntax: $1, $2 for tab stops and placeholders.
 */
export const KEYWORD_SNIPPETS: Record<string, JavaMMSnippetVariant[]> = {
  int: [
    {
      body: "int ${1:nome};",
      description: "Declarar int",
      typingMode: "typed",
    },
  ],
  float: [
    {
      body: "float ${1:nome};",
      description: "Declarar float",
      typingMode: "typed",
    },
  ],
  string: [
    {
      body: "string ${1:nome};",
      description: "Declarar string",
      typingMode: "typed",
    },
  ],
  variavel: [
    {
      body: "variavel ${1:nome} = ${2:valor};",
      description: "Declaração não tipada",
      typingMode: "untyped",
      labelSuffix: "não tipado",
    },
  ],
  void: [
    {
      body: "void ${1:funcao}(${2:params}) {\n\t$3\n}",
      description: "Função tipada",
      typingMode: "typed",
      blockMode: "delimited",
    },
    {
      body: "void ${1:funcao}(${2:params}):\n\t$3",
      description: "Função tipada por indentação",
      typingMode: "typed",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  funcao: [
    {
      body: "funcao ${1:nome}(${2:param1, param2}) {\n\t$3\n}",
      description: "Função não tipada",
      typingMode: "untyped",
      blockMode: "delimited",
      labelSuffix: "não tipado",
    },
    {
      body: "funcao ${1:nome}(${2:param1, param2}):\n\t$3",
      description: "Função não tipada por indentação",
      typingMode: "untyped",
      blockMode: "indentation",
      labelSuffix: "não tipado • indentado",
    },
  ],
  if: [
    {
      body: "if (${1:condicao}) {\n\t$2\n}",
      description: "Bloco if",
      blockMode: "delimited",
    },
    {
      body: "if (${1:condicao}):\n\t$2",
      description: "Bloco if por indentação",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  else: [
    {
      body: "else {\n\t$1\n}",
      description: "Bloco else",
      blockMode: "delimited",
    },
    {
      body: "else:\n\t$1",
      description: "Bloco else por indentação",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  switch: [
    {
      body: "switch (${1:variavel}) {\n\tcase ${2:valor}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}",
      description: "Bloco switch",
      blockMode: "delimited",
    },
    {
      body: "switch (${1:variavel}):\n\tcase ${2:valor}:\n\t\t$3\n\t\tbreak\n\tdefault:\n\t\t$4",
      description: "Bloco switch por indentação",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  for: [
    {
      body: "for (${1:int i = 0}; ${2:i < n}; ${3:++i}) {\n\t$4\n}",
      description: "Laço for",
      typingMode: "typed",
      blockMode: "delimited",
    },
    {
      body: "for (${1:i = 0}; ${2:i < n}; ${3:++i}) {\n\t$4\n}",
      description: "Laço for não tipado",
      typingMode: "untyped",
      blockMode: "delimited",
      labelSuffix: "não tipado",
    },
    {
      body: "for (${1:i = 0}; ${2:i < n}; ${3:++i}):\n\t$4",
      description: "Laço for por indentação",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  while: [
    {
      body: "while (${1:condicao}) {\n\t$2\n}",
      description: "Laço while",
      blockMode: "delimited",
    },
    {
      body: "while (${1:condicao}):\n\t$2",
      description: "Laço while por indentação",
      blockMode: "indentation",
      labelSuffix: "indentado",
    },
  ],
  return: [{ body: "return ${1:valor};", description: "Retornar valor" }],
  break: [{ body: "break;", description: "Interromper laço" }],
  continue: [{ body: "continue;", description: "Continuar laço" }],
  print: [{ body: 'print(${1:"mensagem"});', description: "Imprimir valor" }],
  scan: [
    {
      body: "scan(${1:int}, ${2:variavel});",
      description: "Ler entrada (tipado)",
      typingMode: "typed",
      labelSuffix: "tipado",
    },
    {
      body: "scan(${1:variavel});",
      description: "Ler entrada (não tipado)",
      typingMode: "untyped",
      labelSuffix: "não tipado",
    },
  ],
};
