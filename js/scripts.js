import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //Importa o controle da camera
import * as dat from "dat.gui";
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/Addons.js"; //Loader para carregar objetos glb do blender
import appleTexture from "../textures/apple.jpg";
import watermelonTexture from "../textures/watermelon.jpg";
import grapeTexture from "../textures/grape.jpg";

const basket = new URL("../assets/bag.glb", import.meta.url); //Caminho do modelo

//Carregador de texturas e assets
const textureLoader=new THREE.TextureLoader();
const assetLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer(); //Cria o render
renderer.shadowMap.enabled = true; //Ativa as sombras

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45, //fov
  window.innerWidth / window.innerHeight, //aspect
  0.1, //near
  1000 //far
);
camera.position.set(0, 20, 20); //Muda a posição do objeto
camera.lookAt(0,0,0) //Muda o lugar que a câmera olha

// Descomente essas linhas para poder mexer a camera
const orbit = new OrbitControls(camera, renderer.domElement); //Cria o controle da camera
orbit.update(); //Atualizar sempre que muda a posição da camera

const axesHelper = new THREE.AxesHelper(5); //Mostra os eixos
scene.add(axesHelper);

const world = new CANNON.World();
world.gravity.set(0, -10, 0); // Configuração da gravidade

//Construção do plano
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true; //Faz com que o plano receba sombra
const planeBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1))
})
planeBody.position.set(0,0,0)
planeBody.quaternion.setFromEuler(-Math.PI/2,0,0)
world.addBody(planeBody);
plane.position.copy(planeBody.position);
plane.quaternion.copy(planeBody.quaternion);

let basketModel;
assetLoader.load(basket.href, function (gltf) {
  //Carregar o modelo do blender
  basketModel = gltf.scene;
  basketModel.scale.set(8,8,8);
  scene.add(basketModel);
  basketModel.position.set(0, 0, 0);
  basketModel.receiveShadow = true;
});
const basketBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
});
world.addBody(basketBody);

const gridHelper = new THREE.GridHelper(30, 5); //Args: Tamanho do grid, quantidade de sctions
scene.add(gridHelper);

//vetor de bolas
var balls=[];

function createBall(xPosition, model){
  const ballGeometry = new THREE.SphereGeometry(getRadius(model), 32, 32);
  const ballMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(getTexture(model))
  });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.receiveShadow=true;
  scene.add(ballMesh);

  // Criação dos corpos físicos
  const ballBody = new CANNON.Body({
    shape: new CANNON.Sphere(getRadius(model)),
    mass: 1,
  });
  ballBody.position.set(xPosition, 20, 0);
  balls[balls.length]=[ballMesh, ballBody];
  world.addBody(ballBody);
}

function getRadius(radius){
  switch(radius){
    case 1:
      return 0.4;
    case 2:
      return 0.7;
    case 3:
      return 0.2;
  }
}

function getTexture(texture){
  switch(texture){
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
const options = {
  angle: 10,
  penumbra: 0,
  intensity: 50,
};

gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 100);

let step = 0;

//Pega e normaliza a posição do mouse
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', (event) => {
  createBall((Math.random() * 20)-10, Math.floor(Math.random()*3)+1);
});


const rayCaster = new THREE.Raycaster();
const movPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plano horizontal (Y=0)
const intersection = new THREE.Vector3();

function animate(time) {

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity * 600;

  /*
  ballMesh.position.copy(ballBody.position);
  ballMesh.quaternion.copy(ballBody.quaternion); */

  rayCaster.setFromCamera(mousePosition, camera);

  // Calcula onde o raio intercepta o plano
  rayCaster.ray.intersectPlane(movPlane, intersection);

  const intersects = rayCaster.intersectObjects(scene.children); //Pega todos os objetos que são interceptados pelo ray
 
  //Move a cesta conforme o mouse
  if(basketModel){
    basketBody.position.set(mousePosition.x*15,0,0);
    basketModel.position.set(basketBody.position.x, 0, 0);
  }

  for(let i=0; i<balls.length-1; i++){
    balls[i][0].position.copy(balls[i][1].position);
    balls[i][0].quaternion.copy(balls[i][1].quaternion);
  }

  console.log(balls.length);

  world.step(1 / 60);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate); //Seta qual é o método de animação
