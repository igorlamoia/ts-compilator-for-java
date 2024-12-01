#------------------------------------

# o programa sera numa funcao main

#------------------------------------

<function\*> -> <type> 'IDENT' '(' ')' <bloco> ;
<type> -> 'int' | 'float' | 'string' ;
<bloco> -> '{' <stmtList> '}' ;
<stmtList> -> <stmt> <stmtList> | & ;
<stmt> -> <forStmt>
| <ioStmt>
| <whileStmt>
| <expr> ';'
| <ifStmt>
| <bloco>
| 'break'
| 'continue'
| <declaration>
| ';' ;

#---------------------------

# descricao das instrucoes

#---------------------------

# declaracoes

<declaration> -> <type> <identList> ';' ;
<identList> -> 'IDENT' <restoIdentList> ;
<restoIdentList> -> ',' 'IDENT' <restoIdentList> | & ;

# comando for

<forStmt> -> 'for' '(' <optAtrib> ';' <optExpr> ';' <optAtrib> ')' <stmt> ;
<optExpr> -> <expr> | & ;
<optAtrib> -> <atrib> | & ;

# comandos de IO

<ioStmt> -> 'system' '.' 'out' '.' 'print' '(' <type> ',' 'IDENT' ')' ';'
| 'system' '.' 'in' '.' 'scan' '(' <outList> ')' ';' ;
<outList> -> <out> <restoOutList> ;
<out> -> 'STR' | 'IDENT' | 'NUMdec' | 'NUMfloat' | 'NUMoct' | 'NUMhex';
<restoOutList> -> ',' <out> <restoOutList> | & ;

# comando while

<whileStmt> -> 'while' '(' <expr> ')' <stmt> ;

# comando if

<ifStmt> -> 'if' '(' <expr> ')' <stmt> <elsePart> ;
<elsePart> -> 'else' <stmt> | & ;

#------------------------------

# expressoes

#------------------------------
<atrib> -> 'IDENT' '=' <expr>
| 'IDENT' '+=' <expr>
| 'IDENT' '-=' <expr>
| 'IDENT' '\*=' <expr>
| 'IDENT' '/=' <expr>
| 'IDENT' '%=' <expr>;

<expr> -> <or> ;
<or> -> <and> <restoOr> ;
<restoOr> -> '||' <and> <restoOr> | & ;
<and> -> <not> <restoAnd> ;
<restoAnd> -> '&&' <not> <restoAnd> | & ;
<not> -> '!' <not> | <rel> ;
<rel> -> <add> <restoRel> ;
<restoRel> -> '==' <add> | '!=' <add>
| '<' <add> | '<=' <add>
| '>' <add> | '>=' <add> | & ;
<add> -> <mult> <restoAdd> ;
<restoAdd> -> '+' <mult> <restoAdd>
| '-' <mult> <restoAdd> | & ;
<mult> -> <uno> <restoMult> ;
<restoMult> -> '\*' <uno> <restoMult>
| '/' <uno> <restoMult>
| '%' <uno> <restoMult> | & ;
<uno> -> '+' <uno> | '-' <uno> | <fator> ;
<fator> -> 'NUMint' | 'NUMfloat' | 'NUMoct' | 'NUMhex'
| 'IDENT' | '(' <expr> ')' | 'STR';

#---------

# the end

#---------
