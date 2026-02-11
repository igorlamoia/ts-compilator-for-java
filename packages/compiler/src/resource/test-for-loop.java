int main() {
  print("=== Teste 1: For loop básico ===\n");
  int i;
  for(i = 0; i < 5; i = i + 1) {
    print("i = ");
    print(i);
    print("\n");
  }

  print("\n=== Teste 2: For loop com decremento ===\n");
  int j;
  for(j = 5; j > 0; j = j - 1) {
    print("j = ");
    print(j);
    print("\n");
  }

  print("\n=== Teste 3: For loop com init vazio ===\n");
  int k;
  k = 0;
  for(; k < 3; k = k + 1) {
    print("k = ");
    print(k);
    print("\n");
  }

  print("\n=== Teste 4: For aninhado ===\n");
  int x, y;
  for(x = 0; x < 3; x = x + 1) {
    for(y = 0; y < 2; y = y + 1) {
      print("x=");
      print(x);
      print(" y=");
      print(y);
      print("\n");
    }
  }

  print("\n=== Fim dos testes ===\n");
}
