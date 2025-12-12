void imprimirLinha() {
  system.out.print("====================\n");
}

void saudacao(string nome) {
  system.out.print("Ola, ");
  system.out.print(nome);
  system.out.print("!\n");
}

void mostrarNumero(int n) {
  system.out.print("Numero: ");
  system.out.print(n);
  system.out.print("\n");
}

int main() {
  system.out.print("=== Teste de Funcoes Void ===\n");

  imprimirLinha();

  saudacao("Carlos");
  saudacao("Ana");

  imprimirLinha();

  mostrarNumero(42);
  mostrarNumero(100);

  imprimirLinha();

  system.out.print("Teste concluido!\n");
}
