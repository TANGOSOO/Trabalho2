import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //Importa o controle da camera
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js"; //Loader para carregar objetos glb do blender

const basket = new URL("../assets/bag.glb", import.meta.url); //Caminho do modelo

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

const orbit = new OrbitControls(camera, renderer.domElement); //Cria o controle da camera

const axesHelper = new THREE.AxesHelper(5); //Mostra os eixos
scene.add(axesHelper);

camera.position.set(-10, 30, 30); //Muda a posição do objeto
orbit.update(); //Atualizar sempre que muda a posição da camera

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true; //Faz com que o plano receba sombra

const gridHelper = new THREE.GridHelper(30, 5); //Args: Tamanho do grid, quantidade de sctions
scene.add(gridHelper);


const spotLight = new THREE.SpotLight(0xffffff);
spotLight.intensity = 100; //Muda a intensidade da luz
spotLight.angle = 0.2; //Muda o angulo
scene.add(spotLight);
spotLight.position.set(-30, 30, 0);
spotLight.castShadow = true;

renderer.setClearColor(0xffffff); //Muda o background

const gui = new dat.GUI(); //Cria uma GUI para interação com o usuário
const options = {
  speed: 0.01,
  angle: 0.2,
  penumbra: 0,
  intensity: 1,
};

gui.add(options, "speed", 0, 0.1); //Cria uma barra deslizante
gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 1);

let step = 0;

const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

const assetLoader = new GLTFLoader();
assetLoader.load(basket.href, function (gltf) {
  //Carregar o modelo do blender
  const model = gltf.scene;
  model.scale.set(6,6,6);
  scene.add(model);
  model.position.set(0, 0, 0);
  model.receiveShadow = true;
});

function animate(time) {
  step += options.speed; //Dois comandos para a bola quicar

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity * 600;

  rayCaster.setFromCamera(mousePosition, camera); //Faz o ray ser da camera para o mouse
  const intersects = rayCaster.intersectObjects(scene.children); //Pega todos os objetos que interseptam pelo ray
  console.log(intersects);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate); //Seta qual é o método de animação
