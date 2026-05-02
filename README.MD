# Monorepo to manage the codebase of the IDE compiler

Scan tokens from java -- (simple version of java) character by character getting each token
The IDE is a text editor that allows you to write java code and compile it to byte code

<p align="center">
  <a href="#Instalation">Instalation</a>&nbsp;&nbsp; | <a href="#Instructions">Instructions</a>
</p>

Monaco IDE:
![image](./packages/ide/public/readme/v1.5IDE.png)
![image](./packages/ide/public/readme/tokens.png)

# Instalation

### IDE

```bash
cd packages/ide
npm install && npm run dev
```

### Compiler

```bash
cd packages/compiler
npm install && npm run start
```

Test the compiler with the following code:

```bash
cd packages/compiler
npm run test
```

# Instructions

Readmes for each package are in their respective folders:
[IDE](./packages/ide/README.md)
| [Compiler](./packages/compiler/README.md)

If you want to use the compiler start, you can edit the code by the file in: `packages/compiler/src/resource/input-code.java`

The main code is in the file `packages/compiler/src/index.ts`

[PDF Instruction](./packages/compiler/public/java--descriptionWork.pdf)

## Contributing

Feel free to contribute to the project, we are open to suggestions and improvements.
Even more so if it is for new test cases

Usar:
https://reactbits.dev/animations/laser-flow
https://reactbits.dev/animations/splash-cursor
https://reactbits.dev/backgrounds/galaxy

apresentar ideias ou linguagens em algum lugar sugestivo:
https://reactbits.dev/components/card-swap

Agradecimentos a libs/framewoks:
https://reactbits.dev/animations/logo-loop
Assim fica ainda mais legal com a temática:
https://reactbits.dev/animations/orbit-images

card ou Botão:
https://reactbits.dev/animations/electric-border

Se apresentar:
https://reactbits.dev/components/chroma-grid
https://reactbits.dev/components/profile-card (efeito legal)
