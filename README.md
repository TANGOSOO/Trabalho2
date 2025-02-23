# Game cesta de bolinhas 

## Introdução 
Este projeto deselvonvido na disciplina de **Computação Gráfica** do semestre 2024.2 da **Universidade Federal do Ceará** é uma simulação interativa
que utiliza **Three.js** para renderização 3D e **Cannon-es** 
para física realista. 
O objetivo é criar uma cena onde bolas caem de uma altura e interagem com uma cesta e um plano. 
O usuário pode controlar a posição da cesta com o mouse e ajustar parâmetros da simulação, como gravidade e taxa de geração de bolas.

## Descrição do jogo

O projeto consiste em uma cena 3D onde bolas são geradas aleatoriamente e caem sob a influência da gravidade. 
A cesta pode ser movida horizontalmente com o mouse para tentar "capturar" as bolas. As bolas podem colidir com o chão ou com a cesta, e são removidas da cena após a colisão.

### Principais Funcionalidades

1. **Renderização 3D com Three.js**:
   - A cena é renderizada usando o Three.js, com iluminação, sombras e texturas.
   - Um plano representa o chão, e uma cesta é carregada a partir de um modelo 3D.

2. **Física com Cannon-es**:
   - A física é gerenciada pelo Cannon-es, que simula gravidade, colisões e movimentos realistas.
   - Corpos físicos são criados para o chão, a cesta e as bolas.

3. **Interação do Usuário**:
   - O usuário pode mover a cesta horizontalmente usando o mouse.
   - Uma interface gráfica (GUI) permite ajustar parâmetros como gravidade, intensidade da luz e taxa de geração de bolas.

4. **Geração Aleatória de Bolas**:
   - Bolas são geradas aleatoriamente com texturas e tamanhos diferentes (maçã, melancia e uva).
   - A velocidade inicial das bolas é randomizada para criar variação no movimento.

5. **Colisões e Remoção de Bolas**:
   - As bolas colidem com o chão ou com a cesta e são removidas da cena após a colisão.

---
