import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //Importa o controle da camera
import * as dat from "dat.gui";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/Addons.js"; //Loader para carregar objetos glb do blender
import appleTexture from "../textures/apple.jpg";
import watermelonTexture from "../textures/watermelon.jpg";
import grapeTexture from "../textures/grape.jpg";
import grasssTexture from "../textures/grama.png";
import CannonDebugger from 'cannon-es-debugger'
import { texture, textureLoad } from "three/tsl";

//Variável para começar
let start = false;
const timeVar = {
  maxSeconds: 90,
  startTime: Date.now()
};

//VAR de opçoes
const options = {
  angle: 10,
  penumbra: 0,
  intensity: 50,
  "Balls per Second": 1,
  mute: false,
  allowMiss: true
};

//Modelo da cesta
const basket = new URL("../assets/basket.glb", import.meta.url);

//Carregador de texturas e assets
const textureLoader = new THREE.TextureLoader();
const assetLoader = new GLTFLoader();

//RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//CENA E CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90, //fov
  window.innerWidth / window.innerHeight, //aspect
  0.1, //near
  1000 //far
);
camera.position.set(0, 9, 13); //Muda a posição do objeto
camera.lookAt(0, 0, 0); //Muda o lugar que a câmera olha

//FOGOS DE ARTIFÍCIO
const particleCount = 3000;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.1 + 0.05; // Velocidade inicial maior
  const spread = Math.random() * 0.5;

  positions[i * 3] = Math.cos(angle) * spread;
  positions[i * 3 + 1] = 0;
  positions[i * 3 + 2] = Math.sin(angle) * spread;

  velocities[i * 3] = Math.cos(angle) * speed;
  velocities[i * 3 + 1] = speed * 2; // Sobe mais rápido no começo
  velocities[i * 3 + 2] = Math.sin(angle) * speed;

  // Cor inicial branca (forte no início)
  colors[i * 3] = 1.0;
  colors[i * 3 + 1] = 1.0;
  colors[i * 3 + 2] = 1.0;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
  vertexColors: true, // Ativando cores individuais
  size: 0.15,
  transparent: true,
  opacity: 0.9,
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
particleSystem.position.set(20, 0, 0); // No centro do cenário
const particleSystem2 = new THREE.Points(particleGeometry, particleMaterial);
particleSystem2.position.set(-20, 0, 0); // No centro do cenário

scene.add(particleSystem);
scene.add(particleSystem2);

function animateParticles() {
  const positions = particleSystem.geometry.attributes.position.array;
  const velocities = particleSystem.geometry.attributes.velocity.array;
  const colors = particleSystem.geometry.attributes.color.array;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] += velocities[i * 3]; // Movendo X
    positions[i * 3 + 1] += velocities[i * 3 + 1]; // Movendo Y
    positions[i * 3 + 2] += velocities[i * 3 + 2]; // Movendo Z

    velocities[i * 3 + 1] -= 0.005; // Gravidade puxando para baixo

    // Mudança de cor conforme sobe
    const progress = positions[i * 3 + 1] / 3;
    colors[i * 3] = 1.0;
    colors[i * 3 + 1] = 1.0 - progress;
    colors[i * 3 + 2] = 1.0 - progress;

    // Reinicia partículas ao cair
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      velocities[i * 3] = Math.cos(Math.random() * Math.PI * 2) * 0.05;
      velocities[i * 3 + 1] = Math.random() * 0.2 + 0.1;
      velocities[i * 3 + 2] = Math.sin(Math.random() * Math.PI * 2) * 0.05;
    }
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
  particleSystem.geometry.attributes.color.needsUpdate = true;
}

//CONTROLES DA CAMERA (DESATIVE DEPOIS DE USAR)
//const orbit = new OrbitControls(camera, renderer.domElement);
//orbit.update();

//EIXOS AUXILIARES (DESATIVE DEPOIS DE USAR)
//const axesHelper = new THREE.AxesHelper(5); //Mostra os eixos
//scene.add(axesHelper);

//CRIAÇÃO DO MUNDO FÍSICO
const world = new CANNON.World();
world.gravity.set(0, -1, 0); // Configuração da gravidade

//ILUMINAÇÃO DA CENA
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

//SKYBOX ANTIGA
/*const cubeTextureLoader=new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  '../textures/cubemap/px.png',
  '../textures/cubemap/nx.png',
  '../textures/cubemap/py.png',
  '../textures/cubemap/ny.png',
  '../textures/cubemap/pz.png',
  '../textures/cubemap/nz.png',
]);*/

//SKYBOX ATUAL
const size = 100;
const geometry = new THREE.BoxGeometry(size, size, size);
const materialArray = [
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/px.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/nx.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/py.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/ny.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/pz.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../textures/cubemap/nz.png'), side: THREE.BackSide })
];

const skybox = new THREE.Mesh(geometry, materialArray);
skybox.position.set(0, 49, 0);
skybox.rotateY(-Math.PI/2);
skybox.position.set(2, 49, 0);
scene.add(skybox);


//Construção do plano
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load(grasssTexture),
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true; //Faz com que o plano receba sombra
const planeBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
});
planeBody.position.set(0, 0, 0);
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(planeBody);
plane.position.copy(planeBody.position);
plane.quaternion.copy(planeBody.quaternion);

//CONSTRUÇÃO DA FÍSICA DA CESTA
let basketModel;
assetLoader.load(basket.href, function (gltf) {
  //Carregar o modelo do blender
  basketModel = gltf.scene;
  basketModel.scale.set(6, 6, 6);
  scene.add(basketModel);
  basketModel.position.set(0, 0, 0);
  basketModel.receiveShadow = true;
});

const basketBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
});
//world.addBody(basketBody);

const leftWallGeometry = new THREE.BoxGeometry(0.2, 1.5, 1.5);
const rightWallGeometry = new THREE.BoxGeometry(0.2, 1.5, 1.5);
const topWallGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.2);
const bottomWallGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.2);
const basketBottomGeometry = new THREE.BoxGeometry(2.2, 0.2, 1.8);

const wallMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0
});

const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
const bottomWall = new THREE.Mesh(bottomWallGeometry, wallMaterial);
const basketBottom = new THREE.Mesh(basketBottomGeometry, wallMaterial);
leftWall.position.set(1.3, 1, 0);
rightWall.position.set(-1.3, 1, 0);
topWall.position.set(0, 1, -0.8);
bottomWall.position.set(0, 1, 0.8);
basketBottom.position.set(0, 0.5, 0);
scene.add(leftWall);
scene.add(rightWall);
scene.add(topWall);
scene.add(bottomWall);
scene.add(basketBottom);

const leftWallBody = new CANNON.Body({
    type: CANNON.Body.STATIC, // Torna a parede estática
    position: leftWall.position
});
leftWallBody.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 0.75, 0.75)));
world.addBody(leftWallBody);

const rightWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC, // Torna a parede estática
  position: rightWall.position
});
rightWallBody.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 0.75, 0.75)));
world.addBody(rightWallBody);

const topWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC, // Torna a parede estática
  position: topWall.position
});
topWallBody.addShape(new CANNON.Box(new CANNON.Vec3(1.75, 0.75, 0.1)));
world.addBody(topWallBody);

const bottomWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC, // Torna a parede estática
  position: bottomWall.position
});
bottomWallBody.addShape(new CANNON.Box(new CANNON.Vec3(1.75, 0.75, 0.1)));
world.addBody(bottomWallBody);

const basketBottomBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  position: basketBottom.position
});
basketBottomBody.addShape(new CANNON.Box(new CANNON.Vec3(1.1, 0.1, 0.9)));
world.addBody(basketBottomBody);

//CONSTRUÇÃO DAS BARREIRAS
const xPositiveConstraintWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(15, 15, 0),
  shape: new CANNON.Box(new CANNON.Vec3(0.1, 15, 1.25))
})
world.addBody(xPositiveConstraintWallBody);
const xNegativeConstraintWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(-15, 15, 0),
  shape: new CANNON.Box(new CANNON.Vec3(0.1, 15, 1.25))
})
world.addBody(xNegativeConstraintWallBody);
const zPositiveConstraintWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(0, 15, 1.25),
  shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1))
})
world.addBody(zPositiveConstraintWallBody);
const zNegativeConstraintWallBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(0, 15, -1.25),
  shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1))
})
world.addBody(zNegativeConstraintWallBody);

const gridHelper = new THREE.GridHelper(30, 5);
scene.add(gridHelper);

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load('./music/background-music.mp3', function(buffer) {
  console.log("Áudio carregado com sucesso!");
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  // Reproduz o áudio após o primeiro clique do usuário
  window.addEventListener("click", () => {
      if (!sound.isPlaying) {
          sound.play();
      }
  });
}, function(error) {
  console.error("Erro ao carregar o áudio:", error);
});

//Pontuação
let score = 0;

//vetor de BOLAS
var balls = [];
var ballsToRemove = [];

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
      if(options.allowMiss){
          if(model == 1) score -= 3;
          if(model == 2) score -= 2;
          if(model == 3) score -= 1;
      }
      ballsToRemove.push(ball);
      ballBody.flagRemove=true;
      //createBall(Math.random() * 20 - 10, Math.floor(Math.random() * 3) + 1);
      console.log("Floor");
    }
    if(event.body===basketBottomBody && ballBody.flagRemove===false){
      if(model == 1) score += 10;
      if(model == 2) score += 5;
      if(model == 3) score += 1;
      //createBall(Math.random() * 20 - 10, Math.floor(Math.random() * 3) + 1);
      //createBall(Math.random() * 20 - 10, Math.floor(Math.random() * 3) + 1);
      ballsToRemove.push(ball);
      ballBody.flagRemove=true;
      console.log("Bottom")
    }
  });
}

function getRadius(radius) {
  switch (radius) {
    case 1:
      return 0.4;
    case 2:
      return 0.7;
    case 3:
      return 0.2;
  }
}

function getTexture(texture) {
  switch (texture) {
    case 1:
      return appleTexture;
    case 2:
      return watermelonTexture;
    case 3:
      return grapeTexture;
  }
}

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.intensity = 100; //Muda a intensidade da luz
spotLight.angle = 10; //Muda o angulo
scene.add(spotLight);
spotLight.position.set(0, 30, 0);
spotLight.castShadow = true;

renderer.setClearColor(0xffffff); //Muda o background

const gui = new dat.GUI(); //Cria uma GUI para interação com o usuário

gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 100);
gui.add(options, "Balls per Second", 1, 10, 1);
gui.add(options, "mute").name("Mute").onChange(function(value) {
  if (value) {
      sound.setVolume(0); // Muta o áudio
  } else {
      sound.setVolume(0.5); // Desmuta o áudio (volta ao volume original)
  }
});
gui.add(options, "allowMiss").name("Permitir erros").onChange((value) => {
  options.allowMiss = value;
});

const simulFolder = gui.addFolder('Simulação');
simulFolder.add(world.gravity, 'y', -20,-0.1).step(0.1).name('Gravidade');
simulFolder.open();

//DEBUGGER MOSTRA O WIREFRAME DE TODOS OS CORPOS FÍSICOS
/*const cannonDebugger = new CannonDebugger(scene, world, { 
  color: 0xff0000,
});
cannonDebugger.update();*/

//Pega e normaliza a posição do mouse
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

//Clicar começa o jogo
window.addEventListener("click", (event) => {
  if(!start)
  {
    start = true;
    timeVar.startTime = Date.now();
  }
});

world.addEventListener('postStep', function () {
  for(let i=0; i<ballsToRemove.length; i++){
    scene.remove(ballsToRemove[i][0]);
    world.removeBody(ballsToRemove[i][1]);
  }
});

const rayCaster = new THREE.Raycaster();
const movPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plano horizontal (Y=0)
const intersection = new THREE.Vector3();

//TIMER
const uiScene = new THREE.Scene();
const uiCamera = new THREE.OrthographicCamera( - window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, - window.innerHeight / 2, 1, 10 );
uiCamera.position.z = 1;

const numberTextures = {};
for (let i = 0; i <= 9; i++) {
    numberTextures[i] = textureLoader.load(`../sprites/${i}.png`);
}
const dpTexture = textureLoader.load('../sprites/dp.png');

// Criar material e sprites para os números do timer
function createSprite(texture) {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(material);
}

// Criar os sprites para MM:SS
const timeSprites = [
    createSprite(numberTextures[0]), // M1
    createSprite(numberTextures[0]), // M2
    createSprite(dpTexture),      // :
    createSprite(numberTextures[0]), // S1
    createSprite(numberTextures[0])  // S2
];

// Posicionar os sprites no topo da tela
const timerHeight = (window.innerHeight / 2) - 50;
const timerSpacing = 40; // Adjusted spacing
timeSprites.forEach((sprite, i) => {
    sprite.position.set((i-2)*timerSpacing, timerHeight, 0); // Adjusted Y position
    sprite.scale.set(45, 45, 1); // Ensure sprites are scaled to be visible
    uiScene.add(sprite);
});
timeSprites[2].scale.set(18,39,1);

// Função para atualizar o timer
simulFolder.add(timeVar, 'maxSeconds', 30, 180).step(10).name('Tempo máx (s)');

function updateTimer() {
    let elapsedSeconds = Math.floor((Date.now() - timeVar.startTime) / 1000) % 60;
    let minutesRemaining = Math.floor((timeVar.maxSeconds - elapsedSeconds) / 60) % 60;
    let secondsRemaining = (timeVar.maxSeconds - elapsedSeconds) % 60;

    let timeStr = `${String(minutesRemaining).padStart(2, '0')}${String(secondsRemaining).padStart(2, '0')}`;

    // Atualizar as texturas dos sprites
    timeSprites[0].material.map = numberTextures[timeStr[0]];
    timeSprites[1].material.map = numberTextures[timeStr[1]];
    timeSprites[3].material.map = numberTextures[timeStr[2]];
    timeSprites[4].material.map = numberTextures[timeStr[3]];

    // Ensure the textures are updated
    if(start) {
      timeSprites.forEach(sprite => {
          sprite.material.map.needsUpdate = true;
      });
    }

    if(elapsedSeconds >= timeVar.maxSeconds){
      window.alert("Fim de jogo! Sua pontuação foi: " + score);
      score = 0;
      start = false;
    }
}

let currentSprite = null;
const countdownTextures = [
  textureLoader.load('tres.png'),
  textureLoader.load('dois.png'),
  textureLoader.load('um.png')
];

//SCORE
const numberTexturesP = {};
for (let i = 0; i <= 9; i++) {
    numberTexturesP[i] = textureLoader.load(`../sprites/${i}p.png`);
}

const ptsTexture = textureLoader.load('../sprites/pts.png');

const scoreSprites = [
  createSprite(numberTexturesP[0]),
  createSprite(numberTexturesP[0]),
  createSprite(numberTexturesP[0]),
  createSprite(numberTexturesP[0]),
  createSprite(ptsTexture)
];

let scoreHeight = - window.innerHeight / 2 + 200;
const scoreSpacing = 40;
scoreSprites.forEach((sprite, i) => {
    sprite.position.set((i-2.5)*scoreSpacing, scoreHeight, 0);
    sprite.scale.set(40, 40, 1);
    uiScene.add(sprite);
});

//Criação dos fogos de artificio
function createFirework() {
  const numberOfFireworks = 5; // Número de fogos que explodem ao mesmo tempo
  const particleCount = 200; // Número de partículas
  const explosionHeight = 10; // Altura da explosão

  for (let f = 0; f < numberOfFireworks; f++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Local da explosao
    const explosionPoint = new THREE.Vector3(
      (Math.random() - 0.5) * 30, // Posição X 
      explosionHeight,
      (Math.random() - 0.5) * 30 // Posição Z
    );

    for (let i = 0; i < particleCount; i++) {
      // Posição inicial no ponto de explosão
      positions[i * 3] = explosionPoint.x;
      positions[i * 3 + 1] = explosionPoint.y;
      positions[i * 3 + 2] = explosionPoint.z;

      // Velocidade inicial 
      const angle = Math.random() * Math.PI * 2; 
      const speed = Math.random() * 2 + 1; // Velocidade aleatória
      velocities[i * 3] = Math.cos(angle) * speed; // X
      velocities[i * 3 + 1] = Math.random() * 2 + 1; // Y (para cima)
      velocities[i * 3 + 2] = Math.sin(angle) * speed; // Z

      // Cor aleatória para cada partícula
      colors[i * 3] = Math.random(); // R
      colors[i * 3 + 1] = Math.random(); // G
      colors[i * 3 + 2] = Math.random(); // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true, // Ativa cores individuais para cada partícula
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending, // Da um brilho doideira
    });

    const firework = new THREE.Points(geometry, material);
    scene.add(firework);

    let frames = 240; // Faz o efeito durar uns segundos

    function updateFirework() {
      if (frames-- <= 0) {
        scene.remove(firework);
        geometry.dispose();
        material.dispose();
        return;
      }

      const positions = geometry.attributes.position.array;
      const velocities = geometry.attributes.velocity.array;
      const colors = geometry.attributes.color.array;

      for (let i = 0; i < particleCount; i++) {
        // Atualiza a posição com base na velocidade
        positions[i * 3] += velocities[i * 3] * 0.1; // X
        positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1; // Y
        positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1; // Z

        // Faz as particulas cairem
        velocities[i * 3 + 1] -= 0.02;

        // Efeito de sumir das negocinhas 
        colors[i * 3] *= 0.98;
        colors[i * 3 + 1] *= 0.98;
        colors[i * 3 + 2] *= 0.98;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      material.opacity = frames / 240; // efeito de sumuir
    }

    const fireworkInterval = setInterval(() => {
      if (frames-- <= 0) {
        clearInterval(fireworkInterval);
        scene.remove(firework);
        geometry.dispose();
        material.dispose();
      } else {
        updateFirework();
      }
    }, 16);
  }
}

let lastFireworkScore = 0; // Variável para armazenar o último score que soltou fogos

function updateScoreboard() {
  if (score < 0) score = 0;

  // Atualiza o display do score
  let m4 = Math.floor(score / 1000) % 10;
  let m3 = Math.floor(score / 100) % 10;
  let m2 = Math.floor(score / 10) % 10;
  let m1 = score % 10;

  // Atualizar as texturas dos sprites
  scoreSprites[0].material.map = numberTexturesP[m4];
  scoreSprites[1].material.map = numberTexturesP[m3];
  scoreSprites[2].material.map = numberTexturesP[m2];
  scoreSprites[3].material.map = numberTexturesP[m1];

  scoreSprites.forEach(sprite => {
    sprite.material.map.needsUpdate = true;
    sprite.material.map.needsUpdate = true;
  });

  // Verifica se a pontuação ultrapassou um múltiplo de 100
  if (Math.floor(score / 100) > Math.floor(lastFireworkScore / 100)) {
    createFirework(); // Ativa o efeito de fogos de artifício
    lastFireworkScore = score; // Atualiza o último score que soltou fogos
  }
  // Verifica se a pontuação ultrapassou um múltiplo de 100
  if (Math.floor(score / 100) > Math.floor(lastFireworkScore / 100)) {
    createFirework(); // Ativa o efeito de fogos de artifício
    lastFireworkScore = score; // Atualiza o último score que soltou fogos
  }
}



particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));




particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));


const clock = new THREE.Clock();
let lastTime = 0;

function animate(time) {

  animateParticles();

  let elapsedTime = clock.getElapsedTime();
    
if(start){
    let elapsedTime = clock.getElapsedTime();
    if (elapsedTime - lastTime >= 1/options["Balls per Second"]) {
        lastTime = elapsedTime;
        createBall(Math.random() * 20 - 10, Math.floor(Math.random() * 3) + 1);
    }
}

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity * 600;

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

  for (let i = 0; i < balls.length; i++) {
    if(world.bodies.includes(balls[i][1])){
      balls[i][0].position.copy(balls[i][1].position);
      balls[i][0].quaternion.copy(balls[i][1].quaternion);
    }
  }

  world.step(1 / 60);

  //ATUALIZAÇÃO DO DEBUGGER
  //cannonDebugger.update();

  //ATUALIZAÇÃO DO SCOREBOARD
  updateScoreboard();

  if(start)
  {
   updateTimer();
  }

  renderer.autoClear = false;
  renderer.clearDepth();
 
  renderer.render(scene, camera);
  renderer.render(uiScene, uiCamera);
}

renderer.setAnimationLoop(animate); //Seta qual é o método de animação

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uiCamera.left = window.innerWidth / -2;
  uiCamera.right = window.innerWidth / 2;
  uiCamera.top = window.innerHeight / 2;
  uiCamera.bottom = window.innerHeight / -2;
  uiCamera.updateProjectionMatrix();

  // Update sprite positions on resize
  timeSprites.forEach((sprite, i) => {
    sprite.position.set((i-2)*timerSpacing, timerHeight, 0);
    uiScene.add(sprite);
  });

  scoreHeight =  - window.innerHeight / 2 + 200;
  scoreSprites.forEach((sprite, i) => {
    sprite.position.set((i-2.5)*scoreSpacing, scoreHeight, 0);
  });

});
