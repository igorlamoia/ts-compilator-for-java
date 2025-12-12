// Exemplo Completo: Funções void e retorno de string

// Função void sem parâmetros
void imprimirSeparador() {
  system.out.print("====================================\n");
}

// Função void com parâmetros
void saudacao(string nome, int idade) {
  system.out.print("Ola, ");
  system.out.print(nome);
  system.out.print("! Voce tem ");
  system.out.print(idade);
  system.out.print(" anos.\n");
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
  system.out.print("DEMONSTRACAO DE FUNCOES\n");
  imprimirSeparador();

  // Testando função void
  system.out.print("\n1. Funcoes Void:\n");
  saudacao("Ana", 25);
  saudacao("Carlos", 30);

  // Testando função string
  system.out.print("\n2. Funcoes String:\n");
  string msg;
  msg = obterMensagem();
  system.out.print(msg);
  system.out.print("\n");

  string nomeCompleto;
  nomeCompleto = formatarNome("Maria", "Silva");
  system.out.print("Nome: ");
  system.out.print(nomeCompleto);
  system.out.print("\n");

  // Testando função int
  system.out.print("\n3. Funcoes Int:\n");
  int resultado;
  resultado = somar(10, 20);
  system.out.print("10 + 20 = ");
  system.out.print(resultado);
  system.out.print("\n");

  // Testando função float
  system.out.print("\n4. Funcoes Float:\n");
  float produto;
  produto = multiplicar(3.5, 2.0);
  system.out.print("3.5 * 2.0 = ");
  system.out.print(produto);
  system.out.print("\n");

  imprimirSeparador();
  system.out.print("Todos os testes concluidos!\n");
  imprimirSeparador();
}
