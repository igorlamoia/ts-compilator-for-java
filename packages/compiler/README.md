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
