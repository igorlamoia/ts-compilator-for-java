string saudacao(string nome) {
  return "Ola, ";
}

string despedida() {
  return "Ate logo!";
}

int main() {
  print("=== Teste de Retorno String ===\n");

  string msg1;
  msg1 = saudacao("Maria");
  print(msg1);
  print("Maria\n");

  string msg2;
  msg2 = despedida();
  print(msg2);
  print("\n");

  print("Teste concluido!\n");
}
