# ts-compilator-for-java

A compiler for a simple version of Java, written in TypeScript. This project is part of a monorepo that contains an IDE for the compiler. The compiler scans tokens from java -- (simple version of java) character by character getting each token.

This version contains just the Lexer, but it will be a compiler in the next updates.

## Instalação

```bash
npm install
```

## Usage

```bash
npm run start
```

## Array Parameters

Typed function signatures can receive arrays and matrices by reference.

Fixed array mode requires exact sizes in the signature:

```java
void printa(int vec[2][4]) {
  vec[0][0] = 99;
}
```

Dynamic array mode requires only the number of dimensions:

```java
void printa(int vec[][]) {
  print(vec[0][0]);
}
```

When an array is passed to a function, writes inside the callee are visible to the caller.

Test the compiler with the following code:

```bash
npm run test
```

## Instructions

[PDF](./public/java--descriptionWork.pdf)

## Contributing

Feel free to contribute to the project, we are open to suggestions and improvements.
Even more so if it is for new test cases

Fluxo resumido em uma linha

Código-fonte → caracteres → lexemas → tokens → parser → árvore sintática/AST → tabela de símbolos + análise semântica → representação intermediária → máquina virtual/JIT → execução

Exemplo completo e curto

Código:

mostrar(2 + 3)

1. Lexemas
   mostrar
   (
   2

- 3
  )

2. Tokens
   IDENTIFIER("mostrar")
   LPAREN
   NUMBER("2")
   PLUS
   NUMBER("3")
   RPAREN
3. AST
   Call
   ├── Callee: Identifier("mostrar")
   └── Argument:
   BinaryExpression(+)
   ├── Number(2)
   └── Number(3)
4. Semântica
   mostrar existe?
   aceita 1 argumento?
   2 + 3 é operação válida?
5. IR
   t1 = 2
   t2 = 3
   t3 = add t1, t2
   call mostrar, t3
6. Execução
   calcula t3 = 5
   chama mostrar(5)
   saída: 5
