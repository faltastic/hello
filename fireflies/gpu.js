var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = 1.0 * window.innerHeight,
  SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
  SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2,
  SCREEN_DEPTH_HALF = SCREEN_HEIGHT;
var camera, controls, scene, renderer, fireflies, firefly;
var boid, boids;
var stats;
var hydra = [];
var myScale = 5;

var N = 2 ** 3 // population size
  ,
  gamma = Math.sqrt(SCREEN_HEIGHT_HALF) // visiblity = 1/ sqrt( L scale )  -> L = 1 / gamma^2 
  ,
  beta = 100 // attraction
  ,
  alpha = 0.001 // random walk step size
  ,
  jiggle = new THREE.Vector3(),
  displace = new THREE.Vector3(),
  decayExp;

var FPS = 64;

// Firefly Boid Class 
var Boid = function () {

  this.position = new THREE.Vector3();
  this.mass = 0;

  this.fly = function (otherBoid) {

    jiggle.x = getRandomBetween(-SCREEN_WIDTH_HALF / myScale, SCREEN_WIDTH_HALF / myScale);
    jiggle.y = getRandomBetween(-SCREEN_HEIGHT_HALF / myScale, SCREEN_HEIGHT_HALF / myScale);
    jiggle.z = getRandomBetween(-SCREEN_DEPTH_HALF / myScale, SCREEN_DEPTH_HALF / myScale);

    displace.subVectors(otherBoid.position, this.position); // Xj - Xi
    decayExp = Math.E ** (-gamma * displace.lengthSq()); // e^( -g * r^2 ) 
    displace.multiplyScalar(decayExp * beta);
    // displace.multiplyScalar(decayExp  * beta * otherBoid.mass);

    jiggle.multiplyScalar(alpha);

    this.position.add(displace);
    this.position.add(jiggle);

  };
  /*
   var vector = new THREE.Vector3(),
    _width = 500,
    _height = 500,
    _depth = 200,
    _avoidWalls = true;
    
   this.setAvoidWalls = function (value) {
    _avoidWalls = value;
  };
  this.setWorldSize = function (width, height, depth) {
    _width = width;
    _height = height;
    _depth = depth;
  };

  this.avoidWalls = function () {
   
   if (this.position.x > SCREEN_WIDTH_HALF) {
      this.position.x = SCREEN_WIDTH_HALF;
    } else if (this.position.x < -SCREEN_WIDTH_HALF) {
      this.position.x = -SCREEN_WIDTH_HALF;
    }

    if (this.position.y > SCREEN_HEIGHT_HALF) {
      this.position.y = SCREEN_HEIGHT_HALF;
    } else if (this.position.y < -SCREEN_HEIGHT_HALF) {
      this.position.y = -SCREEN_HEIGHT_HALF;
    }
  };
  */

}


function generateSprite() {
  //https://github.com/mrdoob/three.js/blob/master/examples/canvas_particles_sprites.html

  var canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  var context = canvas.getContext('2d');
  var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);

  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,1)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}


function init() {

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.set(0, 0, 130);

  
  if (!mobile) {
    controls = new THREE.OrbitControls(camera);
    controls.autoRotateSpeed = 1.25;
    controls.autoRotate = true;
    controls.enableZoom = false;


    controls.update();
  }
  

  scene = new THREE.Scene();
  fireflies = [];
  boids = [];

  var material = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(generateSprite()),
    blending: THREE.AdditiveBlending
  });

  for (var i = 0; i < N; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = getRandomBetween(-SCREEN_WIDTH_HALF / myScale, SCREEN_WIDTH_HALF / myScale);
    boid.position.y = getRandomBetween(-SCREEN_HEIGHT_HALF / myScale, SCREEN_HEIGHT_HALF / myScale);
    boid.position.z = getRandomBetween(-SCREEN_DEPTH_HALF / myScale, SCREEN_DEPTH_HALF / myScale);

    boid.mass = getRandomBetween(2, 4);

    firefly = fireflies[i] = new THREE.Sprite(material);
    firefly.scale.set(boid.mass, boid.mass, 1);
    scene.add(firefly);
  }

  //initGPU();

  // Sphere
  var wireRed = new THREE.MeshBasicMaterial({
    color: 0xFF4400, //0xff0093,
    wireframe: true,
    wireframeLinewidth: 1,
    transparent: false
  });
  var wireFill = new THREE.MeshBasicMaterial({
    color: 0x1c264a
  });

  hydra[0] = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(30, 1), wireRed);
  hydra[0].position.x = 0;
  hydra[0].position.y = 0;
  hydra[0].position.z = 0;

  hydra[1] = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(29.5, 1), wireFill);
  hydra[1].position = hydra[0].position;

  scene.add(hydra[1]);
  scene.add(hydra[0]);

  renderer = new THREE.CanvasRenderer();
  renderer.setClearColor(0x1c264a);
  renderer.setPixelRatio(window.devicePixelRatio);

  container = document.getElementById('threeCanvas');
  document.body.appendChild(container);

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//
function animate() {
  setTimeout(function () {
    requestAnimationFrame(animate);
  }, 1000 / FPS);
  render();
}

function render() {
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (boids[j].mass > boids[i].mass) {
        boids[i].fly(boids[j]);
      }
    }
    fireflies[i].position.copy(boids[i].position);
    // firefly.material.opacity = map(firefly.position.z,200,-200,1,0);
  }
  hydra[1].rotation.y -= 0.0051;
  hydra[1].rotation.z -= 0.0051;
  hydra[0].rotation.y -= 0.0051;
  hydra[0].rotation.z -= 0.0051;
  if (!mobile) controls.update();
  renderer.render(scene, camera);
}



function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};








function vanillaFly(i, Xi, Xj){
  
//  for (var n=0; n<3;n++){
//    displaceV[n] = Xj[n] - Xi[n] ;
//  }
//  
//  decay = -gamma * (displaceV[0]**2 + displaceV[1]**2 + displaceV[2]**2 ) ;
//  
//  for (var n=0; n<3;n++){
//    Xi[n] += alpha * JiggleV[i][n] + beta * Math.exp(decay) * dispV[n] ;
//  }
  
  
  //displaceV = Xj - Xi;
  //decay = -gamma * (displaceV[0]**2 + displaceV[1]**2 + displaceV[2]**2 ) ;
  //Xi = Xi +  alpha * JiggleV[i] + beta * Math.exp(decay) * dispV ;

  return Xi;
  
}

function vanillaFlyTest(a,b){
  //a;
  //var c = a[0];
  return a;
  
}



const gpu = new GPU();
//const multiplyMatrix = gpu.createKernel(function (a, b) {
//  var sum = 0;
//  for (var i = 0; i < 512; i++) {
//    sum += a[this.thread.y][i] * b[i][this.thread.x];
//  }
//  return sum;
//}).setOutput([512, 512]);


//gpu.addFunction(vanillaFly);
gpu.addFunction(vanillaFlyTest);


const flyFunc = gpu.createKernel(function (x,m) {
  
  // this.thread.y = 0: N 
  // this.thread.x = 0: 3
  var newX;
  //for (var i = 0; i < this.constants.size; i++) {
      for (var j = 0; j < this.constants.size; j++) {
        //if(m[this.thread.y][j] > m[this.thread.y][i]){
        // newX[i] = vanillaFly(i, x[this.thread.y][i], x[this.thread.y][i]);
        //}
      newX = vanillaFlyTest(x[this.thread.y][this.thread.x], x[j][this.thread.x]);
    }
  //}
 // newX = vanillaFlyTest(x[this.thread.x], x[this.thread.x]);

 

  return newX;
  //return x[this.thread.y][this.thread.x];
}, {
  constants: { size:N },
  output: { x: 3, y: N }
});

let gpuInput = [];
let masses = [];        
let jiggleV, displaceV, decayV;

var x;

initGPU = () => {
  gpuInput = [];
  jiggleV=[];
  for (var i = 0; i < N; i++) {
    gpuInput.push(boids[i].position.toArray());
    masses.push(boids[i].mass);
    jiggleV[i] = [getRandomBetween(-SCREEN_WIDTH_HALF / myScale, SCREEN_WIDTH_HALF / myScale), getRandomBetween(-SCREEN_HEIGHT_HALF / myScale, SCREEN_HEIGHT_HALF / myScale), getRandomBetween(-SCREEN_DEPTH_HALF / myScale, SCREEN_DEPTH_HALF / myScale)];
  }
   x = flyFunc(gpuInput, masses);
}

setPositions = (result) => {
  for (var i = 0; i < N; i++) {
    boids[i].position.fromArray(result[i]);
  }
}

var mobile = false;
init();
animate();
initGPU();
  




//flyFunc(gpuInput);
