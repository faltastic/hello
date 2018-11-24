var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = 1.0 * window.innerHeight,
  SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
  SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var camera, controls, scene, renderer, birds, bird;
var boid, boids;
var stats;
var objects = [];
var myScale = 8;

var N = 64 // population size
  ,
  gamma =  0.90 // Math.sqrt(400) // visiblity = 1/ sqrt( L scale )  -> L = 1 / gamma^2 
  ,
  beta = 100 // attraction
  ,
  alpha = 0.002 // random walk step size
  ,
  gens = 200 // generations
  ,
  jiggle = new THREE.Vector3(),
  displace = new THREE.Vector3(),
  decayExp;

var FPS = 64;

// Firefly Boid Class 
var Boid = function () {
  var vector = new THREE.Vector3(),
    _width = 500,
    _height = 500,
    _depth = 200,
    _avoidWalls = true;
  this.mass;
  this.position = new THREE.Vector3();
  this.positionStart = new THREE.Vector3();
  this.positionTemp = new THREE.Vector3();

  this.setAvoidWalls = function (value) {
    _avoidWalls = value;
  };
  this.setWorldSize = function (width, height, depth) {
    _width = width;
    _height = height;
    _depth = depth;
  };

  this.fly = function (otherBoid) {
    
    jiggle.x = getRandomBetween(-SCREEN_WIDTH_HALF / myScale, SCREEN_WIDTH_HALF / myScale);
    jiggle.y = getRandomBetween(-SCREEN_HEIGHT_HALF / myScale, SCREEN_HEIGHT_HALF / myScale);
    jiggle.z = getRandomBetween(-50, 50);

    displace.subVectors(otherBoid.position, this.position); // Xj - Xi
    decayExp = Math.E ** (-gamma * displace.lengthSq()); // e^( -g * r^2 ) 
    displace.multiplyScalar(decayExp * beta);
    // displace.multiplyScalar(decayExp  * beta * otherBoid.mass);

    jiggle.multiplyScalar(alpha);

    this.position.add(displace);
    this.position.add(jiggle);

  };

  this.avoidWalls = function () {
   /*
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
*/
  };

}





function init() {

  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);

  controls = new THREE.OrbitControls(camera);
  //controls.autoRotate = true;

  camera.position.set(0, 0, 150);
  controls.update();

  scene = new THREE.Scene();
  birds = [];
  boids = [];
  var wireWhite = new THREE.MeshBasicMaterial({
    color: 0xdcdeac,
    wireframe: true,
    wireframeLinewidth: 1,
    transparent: false
    //,morphTargets: true
  });

  for (var i = 0; i < N; i++) {
    boid = boids[i] = new Boid();

    boid.position.x = getRandomBetween(-SCREEN_WIDTH_HALF / myScale, SCREEN_WIDTH_HALF / myScale);
    boid.position.y = getRandomBetween(-SCREEN_HEIGHT_HALF / myScale, SCREEN_HEIGHT_HALF / myScale);
    boid.position.z = getRandomBetween(-100, 100);

    boid.mass = getRandomBetween(1, 5);

    bird = birds[i] = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(1, 0), wireWhite
    );

    scene.add(bird);
  }
  // Sphere
  var wireRed = new THREE.MeshBasicMaterial({
    color: 0x80ffff,
    wireframe: true,
    wireframeLinewidth: 1,
    transparent: false
    //,morphTargets: true
  });
  var wireFill = new THREE.MeshBasicMaterial({
    color: 0x486ae2

  });
  //var geometry1 = new THREE.SphereBufferGeometry(64, 16, 16);
  //geometry1 = new THREE.IcosahedronBufferGeometry(100, 1);
  objects[0] = new THREE.Mesh(
    new THREE.IcosahedronBufferGeometry(30, 1),
    wireRed);
  objects[0].position.x = 0;

  objects[0].position.y = 0;
  objects[0].position.z = 0;


  scene.add(objects[0]);
  // var light = new THREE.AmbientLight(0x404040); // soft white light
  //scene.add(light);
  renderer = new THREE.CanvasRenderer();
  renderer.setClearColor(0x1c264a);
  renderer.setPixelRatio(window.devicePixelRatio);
  //document.addEventListener('mousemove', onDocumentMouseMove, false);

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

function onDocumentMouseMove(event) {
  var vector = new THREE.Vector3(event.clientX - SCREEN_WIDTH_HALF, -event.clientY + SCREEN_HEIGHT_HALF, 0);
  for (var i = 0, il = boids.length; i < il; i++) {
    //boid = boids[i];
    //vector.z = boid.position.z;
    //boid.repulse(vector);
  }
}
//
function animate() {
  //setTimeout(function () {
    requestAnimationFrame(animate);
  //}, 1000 / FPS);
  render();
  // stats.end();
}


function render() {
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      (boids[i]).fly(boids[j]);
    }
    birds[i].position.copy(boids[i].position);

  }
  //runOneBoid(1);
  objects[0].rotation.y -= 0.0051;
  objects[0].rotation.z -= 0.0051;
  controls.update();
  renderer.render(scene, camera);
}

function runOneBoid(i) {

  //color = birds[i].material.color;
  //color.r = color.g = color.b = ( 500 - bird.position.z ) / 100; //1000;

  //bird.material.opacity = (500 - bird.position.z) / 1000;

  //bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
  //bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
  //bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
  //bird.geometry.vertices[5].y = bird.geometry.vertices[4].y = Math.sin(bird.phase) * 5;
  // bird.rotation.y += getRandomBetween(-0.05, 0.05);

}


function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};


init();
animate();