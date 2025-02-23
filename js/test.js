import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //Importa o controle da camera
import * as dat from "dat.gui";
import * as CANNON from 'cannon-es';
import { GLTFLoader } from "three/examples/jsm/Addons.js"; //Loader para carregar objetos glb do blender
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const textureLoader = new THREE.TextureLoader();
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
camera.lookAt(0, 0, 0); //Muda o lugar que a câmera olha
renderer.setClearColor(0xffffff); //Muda o background

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.intensity = 100; //Muda a intensidade da luz
spotLight.angle = 10; //Muda o angulo
scene.add(spotLight);
spotLight.position.set(0, 30, 0);
spotLight.castShadow = true;

// Descomente essas linhas para poder mexer a camera
const orbit = new OrbitControls(camera, renderer.domElement); //Cria o controle da camera
orbit.update(); //Atualizar sempre que muda a posição da camera

const axesHelper = new THREE.AxesHelper(5); //Mostra os eixos
scene.add(axesHelper);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true; //Faz com que o plano receba sombra

// Criar um cubo maior
const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
const boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
// Criar um cubo menor (buraco)
const holeGeometry = new THREE.BoxGeometry(4, 5, 4); // Menor para criar a borda
const holeMesh = new THREE.Mesh(holeGeometry, new THREE.MeshStandardMaterial({ color: 0x0000ff }));
scene.add(holeMesh);
holeMesh.position.set(5,5,5); // Ajustado para ficar apenas na parte de cima
// Posicionar o cubo menor para remover a parte superior


// Converter para Brushes (necessário para operações booleanas)
const boxBrush = new Brush(boxMesh.geometry, boxMesh.material);
const holeBrush = new Brush(holeMesh.geometry, boxMesh.material);
// Subtrair o cubo menor do cubo maior
const eva=new Evaluator()
const resultMesh = eva.evaluate(boxBrush, holeBrush, SUBTRACTION);

// Criar o mesh final e adicionar à cena
scene.add(resultMesh);


function animate(time) {
    renderer.render(scene, camera);
}
  
  renderer.setAnimationLoop(animate); //Seta qual é o método de animação