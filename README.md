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

## Criação das bolas

   - **Descrição**: Cria uma bola com textura e tamanho específicos.
   - **Parâmetros**:
     - `xPosition`: Posição horizontal (eixo X) onde a bola será criada.
     - `model`: Um número que define o tipo de bola (1 para maçã, 2 para melancia, 3 para uva).
   - **Funcionamento**:
     - Gera uma geometria esférica com base no tipo de bola.
     - Aplica uma textura correspondente ao tipo de bola.
     - Cria um corpo físico (`CANNON.Body`) para a bola e define sua posição e velocidade inicial.
     - Adiciona a bola à cena e ao mundo físico.
     - Configura um listener para detectar colisões com o chão ou a cesta.
    
 ```
unction createBall(xPosition, model) {
  const ballGeometry = new THREE.SphereGeometry(getRadius(model), 32, 32);
  const ballMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(getTexture(model)),
  });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.receiveShadow = true;
  ballMesh.position.set(xPosition, 20, 0);
  scene.add(ballMesh);

  // Criação dos corpos físicos
  const ballBody = new CANNON.Body({
    shape: new CANNON.Sphere(getRadius(model)),
    mass: 1,
  });
  ballBody.position.set(xPosition, 20, 0);
  ballBody.velocity.set((Math.random()*25 - 12.5), 0, 0); //Randomiza a velocidade inicial
  let ball=[ballMesh, ballBody];
  balls[balls.length] = ball;
  world.addBody(ballBody);
  ballBody.flagRemove=false;;

  ballBody.addEventListener("collide", (event) => {
    if(event.body===planeBody && ballBody.flagRemove===false){
      ballsToRemove.push(ball);
      ballBody.flagRemove=true;
      console.log("Floor");
    }
    if(event.body===basketBottomBody && ballBody.flagRemove===false){
      ballsToRemove.push(ball);
      ballBody.flagRemove=true;
      console.log("Bottom")
    }
  });
}
```

## Projeto hospedado no Vercel

Disponível em [https://sistema-solar-silk.vercel.app/](linkdovercel)

## Link da Demonstração do projeto

link do video


