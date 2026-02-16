export const INITIAL_CODE = `int main() {
  print("Início do programa");
  int x, y;
  print("Entre com x: ");
  scan(int, x);
  print("Entre com y: ");
  scan(int, y);
  if(x < y) {
    print("x é menor que y\\n");
  } else {
    print("x é maior ou igual a y\\n");
  }

  print("\\nFim do programa");
}`;

export const INITIAL_CODE_WITH_ERRORS = `inteiro main() {
  inteiro i, space, rows;
  inteiro k = 0, count = 0, count1 = 0;
   print("Enter the number of rows: ");.
   if(2 == 2) {
      print("\\nVerdadeiro" + count1);;
   }

   scan(inteiro, rows);
   for (i = 1; i <= rows; ++i) {
      for (space = 1; space <= rows - i; ++space) {
         print("  ");
         ++count;
      }
      while (k != 2 * i - 1) {
         if (count <= rows - 1) {
            print( i + k, " ");
            ++count;
         } else {
            ++count1;
            print( (i + k - 2 * count1), " ");
         }
         ++k;
      }
      count1 = count = k = 0;
      print("\\n");
   }
}`;
