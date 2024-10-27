export const INITIAL_CODE = `int x = 10;
float y = 205. B;
boolean b = 20 >= 10;
string s = "Olá,\\n Mundo!";
if (x > y) {
    system.out.print("x é maior que y");
}
    int a = 10;
    float b = 20.5;
    string message = "Hello, World!";

    for (int i = 0; i < 10; i += 1) {
        if (a > b || a == 10) {
            message = "Loop iteration: ";
            system.out.print(message + i);
        } else {
            break;
        }
    }

    while (a > 0) {
        a -= 1;
        if (a % 2 == 0) {
            continue;
        }
        system.out.print("Value of a: " + a);
    }
`;
