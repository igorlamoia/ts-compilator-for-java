int main() {
  system.out.print("Início do programa");
  int x, y;
  system.out.print("Entre com x: ");
  system.in.scan(int, x);
  system.out.print("Entre com y: ");
  system.in.scan(int, y);
  if(x < y) {
    system.out.print("x é menor que y");
  } else {
    system.out.print("x é maior ou igual a y");
  }

  system.out.print("Fim do programa");
}
