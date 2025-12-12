int main() {
  system.out.print("Testando for loop\n");
  int i;
  for(i = 0; i < 5; i = i + 1) {
    system.out.print("Iteracao ");
    if(i == 3){
      system.out.print("especial ");
      break;
    }
    system.out.print(i);
    system.out.print("\n");
  }
  system.out.print("For loop concluido!\n");
}
