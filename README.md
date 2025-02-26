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

### **getRadius(radius)**
   - **Descrição**: Retorna o raio da bola com base no tipo.
   - **Parâmetros**:
     - `radius`: Um número que define o tipo de bola (1, 2 ou 3).
   - **Retorno**: O raio da bola correspondente.

```javascript
function getRadius(radius)
```

### **getTexture(texture)**
   - **Descrição**: Retorna a textura da bola com base no tipo.
   - **Parâmetros**:
     - `texture`: Um número que define o tipo de bola (1, 2 ou 3).
   - **Retorno**: A textura correspondente.

```javascript
function getTexture(texture)
```
    
### GUI (Interface Gráfica)
   - **Descrição**: Permite ao usuário ajustar parâmetros da simulação.
   - **Funcionamento**:
     - Cria uma interface interativa com controles para:
       - Ângulo e intensidade do holofote.
       - Gravidade da simulação.
       - Taxa de geração de bolas.
```javascript
const gui = new dat.GUI();
```

### CannonDebugger
   - **Descrição**: Ferramenta para visualizar os corpos físicos na cena.
   - **Funcionamento**:
     - Desenha wireframes dos corpos físicos, ajudando no desenvolvimento e depuração.

```javascript

//DEBUGGER MOSTRA O WIREFRAME DE TODOS OS CORPOS FÍSICOS
const cannonDebugger = new CannonDebugger(scene, world, { 
  color: 0xff0000,
});
cannonDebugger.update();
//Pega e normaliza a posição do mouse
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
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


## Fogos de Artifício e Atualização do Placar

Esta parte do código implementa um efeito de fogos de artifício que é ativado sempre que o jogador alcança uma pontuação múltipla de 100. Além disso, o placar é atualizado dinamicamente para refletir a pontuação atual.O efeito de fogos de artifício é criado usando partículas que se movem e mudam de cor ao longo do tempo. Cada partícula tem uma posição, velocidade e cor aleatórias, gerando um efeito visual impressionante.

## Definição do ponto de exlposão 
O ponto de explosão é definido aleatoriamente dentro de uma área específica da cena

```javascript
const explosionPoint = new THREE.Vector3(
  (Math.random() - 0.5) * 30, // Posição X
  explosionHeight, // Altura da explosão
  (Math.random() - 0.5) * 30 // Posição Z
);
```

### **Criação das particulas**
  - Cada partícula é inicializada no ponto de explosão.
  - A velocidade e a direção de cada partícula são definidas aleatoriamente.
  - As cores das partículas também são geradas aleatoriamente.

```javascript
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = explosionPoint.x; // Posição X
  positions[i * 3 + 1] = explosionPoint.y; // Posição Y
  positions[i * 3 + 2] = explosionPoint.z; // Posição Z

  const angle = Math.random() * Math.PI * 2; // Direção aleatória
  const speed = Math.random() * 2 + 1; // Velocidade aleatória
  velocities[i * 3] = Math.cos(angle) * speed; // Velocidade X
  velocities[i * 3 + 1] = Math.random() * 2 + 1; // Velocidade Y (para cima)
  velocities[i * 3 + 2] = Math.sin(angle) * speed; // Velocidade Z

  colors[i * 3] = Math.random(); // Cor R
  colors[i * 3 + 1] = Math.random(); // Cor G
  colors[i * 3 + 2] = Math.random(); // Cor B
}
```
### **Atualização das particulas**
  - As partículas se movem com base em sua velocidade.
  - A velocidade no eixo Y é reduzida ao longo do tempo para simular a gravidade.
  - As cores das partículas são gradualmente atenuadas para criar um efeito de desaparecimento.


```javascript
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] += velocities[i * 3] * 0.1; // Atualiza posição X
  positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1; // Atualiza posição Y
  positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1; // Atualiza posição Z

  velocities[i * 3 + 1] -= 0.02; // Aplica gravidade

  colors[i * 3] *= 0.98; // Atenua cor R
  colors[i * 3 + 1] *= 0.98; // Atenua cor G
  colors[i * 3 + 2] *= 0.98; // Atenua cor B
}
```

### **Renderização e remorção**
  - O efeito dura 240 frames (aproximadamente 4 segundos).
  - Após esse tempo, as partículas são removidas da cena e os recursos são liberados.

```javascript
if (frames-- <= 0) {
  scene.remove(firework);
  geometry.dispose();
  material.dispose();
  return;
}
```

###Atualização do Placar
O placar é atualizado dinamicamente para refletir a pontuação atual. Quando o jogador alcança uma pontuação múltipla de 100, o efeito de fogos de artifício é ativado.

### **Atualização dos Dígitos do Placar**
  - A pontuação é dividida em dígitos individuais (milhares, centenas, dezenas e unidades).
  - Cada dígito é mapeado para uma textura correspondente.

```javascript
let m4 = Math.floor(score / 1000) % 10; // Dígito dos milhares
let m3 = Math.floor(score / 100) % 10; // Dígito das centenas
let m2 = Math.floor(score / 10) % 10; // Dígito das dezenas
let m1 = score % 10; // Dígito das unidades

scoreSprites[0].material.map = numberTexturesP[m4]; // Atualiza milhares
scoreSprites[1].material.map = numberTexturesP[m3]; // Atualiza centenas
scoreSprites[2].material.map = numberTexturesP[m2]; // Atualiza dezenas
scoreSprites[3].material.map = numberTexturesP[m1]; // Atualiza unidades
}
```

### **Ativação dos Fogos de Artifício**
  -Quando a pontuação ultrapassa um múltiplo de 100, o efeito de fogos de artifício é ativado.

```javascript
if (Math.floor(score / 100) > Math.floor(lastFireworkScore / 100)) {
  createFirework(); // Ativa o efeito de fogos de artifício
  lastFireworkScore = score; // Atualiza o último score que soltou fogos
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




