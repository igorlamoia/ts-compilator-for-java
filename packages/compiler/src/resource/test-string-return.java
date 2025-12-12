string saudacao(string nome) {
  return "Ola, ";
}

string despedida() {
  return "Ate logo!";
}

int main() {
  system.out.print("=== Teste de Retorno String ===\n");

  string msg1;
  msg1 = saudacao("Maria");
  system.out.print(msg1);
  system.out.print("Maria\n");

  string msg2;
  msg2 = despedida();
  system.out.print(msg2);
  system.out.print("\n");

  system.out.print("Teste concluido!\n");
}
