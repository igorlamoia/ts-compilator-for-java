void imprimirLinha() {
  print("====================\n");
}

void saudacao(string nome) {
  print("Ola, ");
  print(nome);
  print("!\n");
}

void mostrarNumero(int n) {
  print("Numero: ");
  print(n);
  print("\n");
}

int main() {
  print("=== Teste de Funcoes Void ===\n");

  imprimirLinha();

  saudacao("Carlos");
  saudacao("Ana");

  imprimirLinha();

  mostrarNumero(42);
  mostrarNumero(100);

  imprimirLinha();

  print("Teste concluido!\n");
}
