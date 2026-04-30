# Preview Card Snap Stack Design

## Goal

Trocar o scroll livre das categorias do preview por navegacao card-a-card, com foco por clique no card e por icones de navegacao acima e sobrepostos a direita da area rolavel.

## Approach

Criar um componente especifico para o painel de preview em vez de expandir o `ScrollStack` generico. O novo componente controla um `activeIndex`, intercepta wheel/touch/teclado para avancar uma categoria por vez, e usa a mesma funcao de foco para cliques em cards e nos icones.

## UI Structure

- Uma barra superior de icones fica fora e acima do `PerfectScrollbar`.
- Uma rail vertical de icones fica posicionada de forma absoluta sobre a direita da area rolavel.
- Os cards permanecem dentro do `PerfectScrollbar`, que continua exibindo o feedback visual da posicao.
- O card ativo recebe maior `z-index`, escala e destaque visual; os demais ficam recuados sem impedir clique.

## Accessibility

Os controles de icone usam `button`, `aria-label` e `aria-pressed`. Os cards sao focaveis por teclado e tambem aceitam Enter/Espaco para foco.

## Test Strategy

Cobrir a renderizacao das duas navegacoes de icones, o foco por clique no card e a troca de foco por clique nos icones. A movimentacao de wheel usa um helper puro para garantir incremento/decremento limitado aos limites da lista.
