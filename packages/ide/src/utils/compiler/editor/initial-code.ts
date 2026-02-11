export const INITIAL_CODE = `int main() {
  print("Início do programa");
  int x, y;
  print("Entre com x: ");
  scan(int, x);
  print("Entre com y: ");
  scan(int, y);
  if(x < y) {
    print("x é menor que y\\n");
  } else {
    print("x é maior ou igual a y\\n");
  }

  print("\\nFim do programa");
}`;
