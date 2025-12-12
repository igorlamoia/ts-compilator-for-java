int main() {
  system.out.print("Testando break:\\n");
  int i;
  for(i = 0; i < 10; i = i + 1) {
    if (i == 5) {
      system.out.print("Break em i = 5\\n");
      break;
    }
    system.out.print(i);
    system.out.print("\\n");
  }

  system.out.print("\\nTestando continue:\\n");
  int j;
  for(j = 0; j < 5; j = j + 1) {
    if (j == 2) {
      system.out.print("Continue em j = 2\\n");
      continue;
    }
    system.out.print(j);
    system.out.print("\\n");
  }

  system.out.print("\\nTeste concluido!\\n");
}
