var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = 1.0 * window.innerHeight,
  SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
  SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2,
  SCREEN_DEPTH_HALF = SCREEN_WIDTH / 2;
var camera, controls, scene, renderer, fireflies, firefly;
var boid, boids;
var hydra = [];
var myScale = 7;

var N = 2 ** 7 // population size
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

  
  // https://en.wikipedia.org/wiki/Firefly_algorithm
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
}

function generateSprite() {
  //https://github.com/mrdoob/three.js/blob/master/examples/canvas_particles_sprites.html

  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
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
  camera.position.set(0, 0, 120);
 
  renderer = new THREE.CanvasRenderer();
  renderer.setClearColor(0x1c264a);
  renderer.setPixelRatio(window.devicePixelRatio);

  container = document.getElementById('threeCanvas');
  document.body.appendChild(container);

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
  
  
 if (!mobile) {
  controls = new THREE.OrbitControls(camera, container);
  controls.autoRotateSpeed = 0.5;
  controls.autoRotate = true;
  controls.enableZoom = false;

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

    boid.mass = getRandomBetween(2, 5);
    // to pause
    // boid.mass= 5;

    firefly = fireflies[i] = new THREE.Sprite(material);
    firefly.scale.set(boid.mass, boid.mass, 1);
    scene.add(firefly);
  }

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

// HELPERS

function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};


//init();
//animate();