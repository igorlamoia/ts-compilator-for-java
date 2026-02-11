int main() {
  print("Testando break:\\n");
  int i;
  for(i = 0; i < 10; i = i + 1) {
    if (i == 5) {
      print("Break em i = 5\\n");
      break;
    }
    print(i);
    print("\\n");
  }

  print("\\nTestando continue:\\n");
  int j;
  for(j = 0; j < 5; j = j + 1) {
    if (j == 2) {
      print("Continue em j = 2\\n");
      continue;
    }
    print(j);
    print("\\n");
  }

  print("\\nTeste concluido!\\n");
}
