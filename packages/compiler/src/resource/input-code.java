int main() {
  print("Testando for loop\n");
  int i;
  for(i = 0; i < 5; i = i + 1) {
    print("Iteracao ");
    if(i == 3){
      print("especial ");
      break;
    }
    print(i);
    print("\n");
  }
  print("For loop concluido!\n");
}
