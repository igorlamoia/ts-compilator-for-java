// Exemplo Completo: Funções void e retorno de string

// Função void sem parâmetros
void imprimirSeparador() {
  print("====================================\n");
}

// Função void com parâmetros
void saudacao(string nome, int idade) {
  print("Ola, ");
  print(nome);
  print("! Voce tem ");
  print(idade);
  print(" anos.\n");
}

// Função que retorna string sem parâmetros
string obterMensagem() {
  return "Bem-vindo ao compilador Java--!";
}

// Função que retorna string com parâmetros
string formatarNome(string primeiro, string ultimo) {
  return primeiro;
}

// Função que retorna int
int somar(int a, int b) {
  return a + b;
}

// Função que retorna float
float multiplicar(float x, float y) {
  return x * y;
}

int main() {
  imprimirSeparador();
  print("DEMONSTRACAO DE FUNCOES\n");
  imprimirSeparador();

  // Testando função void
  print("\n1. Funcoes Void:\n");
  saudacao("Ana", 25);
  saudacao("Carlos", 30);

  // Testando função string
  print("\n2. Funcoes String:\n");
  string msg;
  msg = obterMensagem();
  print(msg);
  print("\n");

  string nomeCompleto;
  nomeCompleto = formatarNome("Maria", "Silva");
  print("Nome: ");
  print(nomeCompleto);
  print("\n");

  // Testando função int
  print("\n3. Funcoes Int:\n");
  int resultado;
  resultado = somar(10, 20);
  print("10 + 20 = ");
  print(resultado);
  print("\n");

  // Testando função float
  print("\n4. Funcoes Float:\n");
  float produto;
  produto = multiplicar(3.5, 2.0);
  print("3.5 * 2.0 = ");
  print(produto);
  print("\n");

  imprimirSeparador();
  print("Todos os testes concluidos!\n");
  imprimirSeparador();
}
