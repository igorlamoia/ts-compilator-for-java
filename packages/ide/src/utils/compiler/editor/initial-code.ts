export const INITIAL_CODE = `int main() {
  system.out.print("Início do programa");
  int x, y;
  system.out.print("Entre com x: ");
  system.in.scan(int, x);
  system.out.print("Entre com y: ");
  system.in.scan(int, y);
  if(x < y) {
    system.out.print("x é menor que y\\n");
  } else {
    system.out.print("x é maior ou igual a y\\n");
  }

  system.out.print("\\nFim do programa");
}`;
