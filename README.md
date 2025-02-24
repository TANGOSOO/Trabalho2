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
    
 ```javascript
function createBall(xPosition, model) {
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
### Função animate
   - **Descrição**: Função principal de animação, chamada continuamente para atualizar a cena e a física.
   - **Funcionamento**:
     - Atualiza a posição da cesta com base na posição do mouse.
     - Gera novas bolas em intervalos regulares, dependendo da taxa configurada na GUI.
     - Sincroniza as posições e rotações dos objetos 3D com os corpos físicos.
     - Atualiza o mundo físico e renderiza a cena.
     - Remove bolas que colidiram com o chão ou a cesta.
    
   ```javascript
function animate(time) {
  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity * 600;

  delay=60/options["Balls per Second"];

  rayCaster.setFromCamera(mousePosition, camera);

  // Calcula onde o raio intercepta o plano
  rayCaster.ray.intersectPlane(movPlane, intersection);

  const intersects = rayCaster.intersectObjects(scene.children); //Pega todos os objetos que são interceptados pelo ray

  //Move a cesta conforme o mouse
  if (basketModel) {
    basketModel.position.set(mousePosition.x * 15, 0, 0);
    leftWall.position.set(basketModel.position.x-1.3, 1, 0);
    rightWall.position.set(basketModel.position.x+1.3, 1, 0);
    topWall.position.set(basketModel.position.x, 1, -0.8);
    bottomWall.position.set(basketModel.position.x, 1, 0.8);
    basketBottom.position.set(basketModel.position.x, 0.5, 0);

    basketBottomBody.position.copy(basketBottom.position);
    leftWallBody.position.copy(leftWall.position);
    rightWallBody.position.copy(rightWall.position);
    topWallBody.position.copy(topWall.position);
    bottomWallBody.position.copy(bottomWall.position);
  }

  if(cont==delay){
    createBall(Math.random() * 20 - 10, Math.floor(Math.random() * 3) + 1);
    cont=0;
    if(cont>=60/options["Balls per Second"]){
      cont=0;
    }
  }else{
    cont++;
  }

  for (let i = 0; i < balls.length; i++) {
    if(world.bodies.includes(balls[i][1])){
      balls[i][0].position.copy(balls[i][1].position);
      balls[i][0].quaternion.copy(balls[i][1].quaternion);
    }
  }

  world.step(1 / 60);

  //ATUALIZAÇÃO DO DEBUGGER
  cannonDebugger.update();

  //ATUALIZAÇÃO DO SCOREBOARD
  updateScoreboard();

  updateTimer();
  renderer.autoClear = false;
  renderer.clearDepth();
 
  renderer.render(scene, camera);
  renderer.render(uiScene, uiCamera);
}
```
    
### GUI (Interface Gráfica)
   - **Descrição**: Permite ao usuário ajustar parâmetros da simulação.
   - **Funcionamento**:
     - Cria uma interface interativa com controles para:
       - Ângulo e intensidade do holofote.
       - Gravidade da simulação.
       - Taxa de geração de bolas.
```
const gui = new dat.GUI();
```

###  **Função para atualizar o timer**
   - **Descrição**: Atualiza um timer visual na cena, exibindo o tempo decorrido desde o início da simulação.
   - **Funcionamento**:
     1. **Cálculo do Tempo Decorrido**:
        - O tempo inicial (`startTime`) é armazenado no início da simulação usando `Date.now()`.
        - A cada chamada da função, o tempo decorrido é calculado em segundos.
        - O tempo é convertido em minutos e segundos.
     2. **Formatação do Tempo**:
        - O tempo é formatado como uma string no formato `MMSS`, onde `MM` são os minutos e `SS` são os segundos.
        - Exemplo: `03:45` é representado como `"0345"`.
     3. **Atualização das Texturas**:
        - A string do tempo é usada para atualizar as texturas de sprites que representam os dígitos do timer.
        - Cada dígito do tempo é mapeado para uma textura correspondente (por exemplo, `numberTextures["3"]` para o dígito `3`).
     4. **Atualização das Texturas na Cena**:
        - As texturas dos sprites são atualizadas para refletir o tempo atual.
        - A propriedade `needsUpdate` é definida como `true` para garantir que as texturas sejam renderizadas corretamente.
   - **Exemplo de Uso**:
     - Se o tempo decorrido for 2 minutos e 30 segundos, a função atualiza os sprites para exibir `02:30`.

```javascript
let startTime = Date.now();
function updateTimer() {
    let elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    let minutes = Math.floor(elapsedSeconds / 60);
    let seconds = elapsedSeconds % 60;

    let timeStr = `${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}`;

    // Atualizar as texturas dos sprites
    timeSprites[0].material.map = numberTextures[timeStr[0]];
    timeSprites[1].material.map = numberTextures[timeStr[1]];
    timeSprites[3].material.map = numberTextures[timeStr[2]];
    timeSprites[4].material.map = numberTextures[timeStr[3]];

    // Ensure the textures are updated
    timeSprites.forEach(sprite => {
        sprite.material.map.needsUpdate = true;
    });
}
```

### Câmera
- **Tipo**: `THREE.PerspectiveCamera`
  - A câmera é configurada com um campo de visão (FOV) de 45 graus, proporção de aspecto (`aspect`) baseada na largura e altura da janela, e planos de corte (`near` e `far`) para definir o que é visível.
  - Posição inicial: `(0, 20, 20)`.
  - Direção: A câmera olha para o ponto `(0, 0, 0)`.

### Controles de Câmera
- **OrbitControls**:
  - Permite ao usuário mover a câmera livremente pela cena, rotacionando, ampliando e deslocando.
  - Habilitado com `OrbitControls(camera, renderer.domElement)`.
  - Atualizado a cada frame com `orbit.update()`.
 
  - ### Movimento da Cesta com o Mouse
- **Funcionamento**:
  - A posição do mouse é capturada com o evento `mousemove`.
  - Um `Raycaster` é usado para calcular a interseção entre o raio do mouse e um plano invisível na cena.
  - A cesta é movida horizontalmente com base na posição do mouse, mantendo-se alinhada ao eixo X.
  - As paredes e o fundo da cesta também são movidos para acompanhar a cesta.

### Interação com o Mouse
- **Evento `click`**:
  - Quando o usuário clica na tela, uma nova bola é gerada na posição horizontal do mouse.
  - A bola é criada com um tipo aleatório.

## Projeto hospedado no Vercel

Disponível em [https://sistema-solar-silk.vercel.app/](linkdovercel)

## Link da Demonstração do projeto

link do video


