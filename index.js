import * as THREE from "three";
import { Audio, AudioListener, AudioLoader } from "three";

let audioListener = new THREE.AudioListener();
let sound;

let audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/fabric.wav', function(buffer) {
    sound = new THREE.Audio(audioListener).setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5); 
});

let scene, camera, renderer;
let myObjects = [];
let inactiveMat, activeMat;
let mouse;
let selectedObject = null;


function loadBox() {
  let boxGeo = new THREE.BoxGeometry();
  let boxMat = new THREE.MeshBasicMaterial({ color: 0xab00ff });
  let cube = new THREE.Mesh(boxGeo, boxMat); 
  scene.add(cube);
}

// This function sets up a more complex scroll control for the camera
let cameraPathPosition = 0;
function setupScrollAlongPathControls() {

  // setup a path composed of multiple points
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),  // Start point
    new THREE.Vector3(1.82, 8.8, -50),    // End point
  ]);

  // create a simple line to visualize the path
  const points = cameraPath.getPoints(50);
  // const geometry = new THREE.BufferGeometry().setFromPoints(points);
  // const material = new THREE.LineBasicMaterial({ color: "yellow" });
  // const line = new THREE.Line(geometry, material);
  // line.position.set(0, -0.1, 0); // offset the line a bit so it remains visible
  // scene.add(line);

  const textureLoader = new THREE.TextureLoader();

  
  const displayFront = textureLoader.load("img/front.png");
  const displayBack = textureLoader.load("img/back.png");
  const displaySide = textureLoader.load("img/side.png");
  
  const frontTexture = new THREE.MeshBasicMaterial({ map: displayFront });
  const backTexture = new THREE.MeshBasicMaterial({ map: displayBack });
  const sideTexture = new THREE.MeshBasicMaterial({ map: displaySide });
  
  // Create an array of textures
  const textures = [frontTexture, backTexture, sideTexture];
  
  // Create the initial material for the plane
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  // Create the plane
  const planeGeometry = new THREE.PlaneGeometry(6.5, 2); // width, height
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  
  // Get the last point of the camera path
  const endPoint = points[points.length - 1];
  
  // Set the position of the plane
  plane.position.set(endPoint.x, endPoint.y, endPoint.z);
  
  // Add the plane to the scene
  scene.add(plane);
  
  let currentTextureIndex = 0; // Index to keep track of the current texture
  
  // Function to switch the material
  function switchMaterial() {
    // Increment the current texture index
    currentTextureIndex = (currentTextureIndex + 1) % textures.length;
  
    // Set the new material to the plane
    plane.material = textures[currentTextureIndex].clone(); // Clone the material to avoid sharing the same material instance
    plane.material.needsUpdate = true; // Update the material
  }
  
  // Set interval to switch materials every 4 seconds
  setInterval(switchMaterial, 2000); // 4000 milliseconds = 4 seconds

  // set the camera to the start position
  camera.position.set(0, 0, 0);
  camera.lookAt(0,0,-50);

  // then add our 'wheel' event listener
  renderer.domElement.addEventListener("wheel", (e) => {
    cameraPathPosition += e.deltaY * 0.0001;
    // constrain this value between 0 and 1, because that is what the following function expects
    cameraPathPosition = Math.max(0, Math.min(0.99, cameraPathPosition));
    const newCameraPosition = cameraPath.getPointAt(cameraPathPosition);
    camera.position.set(
      newCameraPosition.x,
      newCameraPosition.y,
      newCameraPosition.z
    );
    if (sound && !sound.isPlaying) {
      sound.play();
    }
  });
}


function init() {
  // create a scene in which all other objects will exist
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x181716);

  // create a camera and position it in space
  let aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.domElement.style.zIndex = '100';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  // const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  // directionalLight.position.set(1, 1, 1);
  // scene.add(directionalLight);

    // setupSimpleScollControls();

  // or just load a box into the scene
  // loadBox();
  mouse = new THREE.Vector2(0, 0);

  loop();
}



function loop() {
  // finally, take a picture of the scene and show it in the <canvas>
  renderer.render(scene, camera);

  window.requestAnimationFrame(loop); // pass the name of your loop function into this function

}

document.querySelector(".entrance").addEventListener('click', () => {
  if (!scene) {
      init();
      setupScrollAlongPathControls();

  }
});

