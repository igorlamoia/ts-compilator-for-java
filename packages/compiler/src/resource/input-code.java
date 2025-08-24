int main() {
  int numBloco;
  numBloco = 0;
  int divBloco;
  divBloco = 0;
  int restoBloco;
  restoBloco = 0;
  system.out.print("Entre com o inteiro: ");
  system.in.scan(int, numBloco);

  system.out.print(numBloco);
  system.out.print(" = ");

  while (numBloco > 1) {
    divBloco = 2;

    while (numBloco % divBloco != 0) {
      divBloco = divBloco + 1;
    }

    system.out.print(divBloco);

    numBloco = numBloco / divBloco;

    if (numBloco > 1) {
      system.out.print(" * ");
    }
  }

  system.out.print("\n");
  system.out.print("finalizando");
}
