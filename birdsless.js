// Based on http://www.openprocessing.org/visuals/?visualID=6910
var Boid = function () {
  var vector = new THREE.Vector3(),
    _acceleration,
    _width = 500,
    _height = 500,
    _depth = 50,
    _goal,
    _neighborhoodRadius = 80,
    _maxSpeed = 2,
    _maxSteerForce = 0.151,
    _avoidWalls = true; //false;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();
  this.setGoal = function (target) {
    _goal = target;
  };
  this.setAvoidWalls = function (value) {
    _avoidWalls = value;
  };
  this.setWorldSize = function (width, height, depth) {
    _width = width;
    _height = height;
    _depth = depth;
  };
  this.run = function (boids) {
    if (_avoidWalls) {
      vector.set(-_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(_width, this.position.y, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, -_height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, _height, this.position.z);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, this.position.y, -_depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
      vector.set(this.position.x, this.position.y, _depth);
      vector = this.avoid(vector);
      vector.multiplyScalar(5);
      _acceleration.add(vector);
    }
    // else {
    //  this.checkBounds();
    // }
    if (Math.random() > 0.5) {
      this.flock(boids);
    }
    this.move();
  };
  this.flock = function (boids) {
    if (_goal) {
      _acceleration.add(this.reach(_goal, 0.005));
    }
    _acceleration.add(this.alignment(boids));
    _acceleration.add(this.cohesion(boids));
    _acceleration.add(this.separation(boids));
  };
  this.move = function () {
    this.velocity.add(_acceleration);
    var l = this.velocity.length();
    if (l > _maxSpeed) {
      this.velocity.divideScalar(l / _maxSpeed);
    }
    this.position.add(this.velocity);
    _acceleration.set(0, 0, 0);
  };
  this.checkBounds = function () {
    if (this.position.x > _width) this.position.x = -_width;
    if (this.position.x < -_width) this.position.x = _width;
    if (this.position.y > _height) this.position.y = -_height;
    if (this.position.y < -_height) this.position.y = _height;
    if (this.position.z > _depth) this.position.z = -_depth;
    if (this.position.z < -_depth) this.position.z = _depth;
  };
  //
  this.avoid = function (target) {
    var steer = new THREE.Vector3();
    steer.copy(this.position);
    steer.sub(target);
    steer.multiplyScalar(1 / this.position.distanceToSquared(target));
    return steer;
  };
  this.repulse = function (target) {
    var distance = this.position.distanceTo(target);
    if (distance < 150) {
      var steer = new THREE.Vector3();
      steer.subVectors(this.position, target);
      steer.multiplyScalar(0.5 / distance);
      _acceleration.add(steer);
    }
  };
  this.reach = function (target, amount) {
    var steer = new THREE.Vector3();
    steer.subVectors(target, this.position);
    steer.multiplyScalar(amount);
    return steer;
  };
  this.alignment = function (boids) {
    var boid,
      velSum = new THREE.Vector3(),
      count = 0;
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6) continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        velSum.add(boid.velocity);
        count++;
      }
    }
    if (count > 0) {
      velSum.divideScalar(count);
      var l = velSum.length();
      if (l > _maxSteerForce) {
        velSum.divideScalar(l / _maxSteerForce);
      }
    }
    return velSum;
  };
  this.cohesion = function (boids) {
    var boid,
      distance,
      posSum = new THREE.Vector3(),
      steer = new THREE.Vector3(),
      count = 0;
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6) continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        posSum.add(boid.position);
        count++;
      }
    }
    if (count > 0) {
      posSum.divideScalar(count);
    }
    steer.subVectors(posSum, this.position);
    var l = steer.length();
    if (l > _maxSteerForce) {
      steer.divideScalar(l / _maxSteerForce);
    }
    return steer;
  };
  this.separation = function (boids) {
    var boid,
      distance,
      posSum = new THREE.Vector3(),
      repulse = new THREE.Vector3();
    for (var i = 0, il = boids.length; i < il; i++) {
      if (Math.random() > 0.6) continue;
      boid = boids[i];
      distance = boid.position.distanceTo(this.position);
      if (distance > 0 && distance <= _neighborhoodRadius) {
        repulse.subVectors(this.position, boid.position);
        repulse.normalize();
        repulse.divideScalar(distance);
        posSum.add(repulse);
      }
    }
    return posSum;
  };
};
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = 1.0 * window.innerHeight,
  SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
  SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var camera, scene, renderer, birds, bird;
var boid, boids;
var stats;
var objects = [];
init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    1,
    10000
  );
  camera.position.z = 450;
  scene = new THREE.Scene();
  birds = [];
  boids = [];
  for (var i = 0; i < 246; i++) {
    boid = boids[i] = new Boid();
    boid.position.x = Math.random() * 400 - 200;
    boid.position.y = Math.random() * 400 - 150;
    boid.position.z = Math.random() * 400 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.setAvoidWalls(true);
    // boid.setWorldSize(500, 500, 250);
    boid.setWorldSize(100, 100, 10);
    bird = birds[i] = new THREE.Mesh(
      new Bird(),
      new THREE.MeshBasicMaterial({
        color: 0x00f8fc, //0xffffff,
        //, side: THREE.DoubleSide
      })
    );
    bird.phase = Math.floor(Math.random() * 62.83);
    scene.add(bird);
  }
  // Sphere
  var wireRed = new THREE.MeshBasicMaterial({
    color: 0xdcdeac,
    wireframe: true,
    wireframeLinewidth: 2,
    transparent: false,
    //,morphTargets: true
  });
  var wireFill = new THREE.MeshBasicMaterial({
    color: 0xdc264a,
  });
  //var geometry1 = new THREE.SphereBufferGeometry(64, 16, 16);
  //geometry1 = new THREE.IcosahedronBufferGeometry(100, 1);
  objects[0] = new THREE.Mesh(
    new THREE.IcosahedronBufferGeometry(100, 1),
    wireRed
  );
  objects[0].position.x = 0;
  objects[0].position.y = 50;
  objects[0].position.y = 20;
  objects[0].position.z = 200;
  objects[0].userData = {
    URL: "http://google.com",
  };
  //    objects[1] = new THREE.Mesh(
  //        new THREE.SphereBufferGeometry(99, 1),
  //        wireFill);
  //
  //    objects[1].position.x = 0;
  //    objects[1].position.y = 50;
  //    objects[1].position.y = 20;
  //    objects[1].position.z = 100;
  //    scene.add(objects[1]);

  scene.add(objects[0]);
  // var light = new THREE.AmbientLight(0x404040); // soft white light
  //scene.add(light);
  renderer = new THREE.CanvasRenderer();
  renderer.setClearColor(0x1c264a);
  renderer.setPixelRatio(window.devicePixelRatio);
  //renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  //document.body.appendChild(renderer.domElement);
  container = document.getElementById("threeCanvas");
  document.body.appendChild(container);
  //renderer = new THREE.WebGLRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);
  //stats = new Stats();
  //document.getElementById('container').appendChild(stats.dom);
  //
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  var vector = new THREE.Vector3(
    event.clientX - SCREEN_WIDTH_HALF,
    -event.clientY + SCREEN_HEIGHT_HALF,
    0
  );
  for (var i = 0, il = boids.length; i < il; i++) {
    boid = boids[i];
    vector.z = boid.position.z;
    boid.repulse(vector);
  }
}
//
function animate() {
  requestAnimationFrame(animate);
  // stats.begin();
  render();
  // stats.end();
}

function render() {
  for (var i = 0, il = birds.length; i < il; i++) {
    boid = boids[i];
    boid.run(boids);
    bird = birds[i];
    bird.position.copy(boids[i].position);
    color = bird.material.color;
    color.r = color.g = color.b = (500 - bird.position.z) / 100; //1000;
    bird.material.opacity = 1; // (500 - bird.position.z) / 1000;
    bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
    bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
    bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
    bird.geometry.vertices[5].y = bird.geometry.vertices[4].y =
      Math.sin(bird.phase) * 5;
  }
  objects[0].rotation.y += 0.001;
  objects[0].rotation.z += 0.001;
  // objects[1].rotation.y += 0.0051;
  //objects[1].rotation.z += 0.0051;
  renderer.render(scene, camera);
}

function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
