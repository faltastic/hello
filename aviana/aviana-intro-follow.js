// Based on http://www.openprocessing.org/visuals/?visualID=6910

var Boid = function () {
    var vector = new THREE.Vector3(),
        _acceleration, _width = 400,
        _height = 400,
        _depth = 300,
        _goal, _neighborhoodRadius = 50,
        _maxSpeed = 2,
        _maxSteerForce = 0.1,
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
           // _acceleration.add(this.reach(_goal, 0.005));
            _acceleration.add(this.reachFast(_goal, 0.5));
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
    this.disperse = function (target) {
        var distance = this.position.distanceTo(target);
        if (distance < 1500) {
            var steer = new THREE.Vector3();
            steer.subVectors(this.position, target);
            steer.multiplyScalar(0.5 / distance);
            _acceleration.add(steer);
            //console.log("dispersing");
        }
    };

    this.burst = function (){
        var double = this.position;
        this.setGoal(this.position.multiplyScalar(1.0));
    }

    this.reach = function (target, amount) {
        var distance = this.position.distanceTo(target);
        var steer = new THREE.Vector3();

        steer.subVectors(target, this.position);
        steer.multiplyScalar(amount / distance);

        return steer;
        //console.log("reach center");
    };
    this.reachFast = function (target, amount) {
        var distance = this.position.distanceTo(target);
        var steer = new THREE.Vector3();
        if (distance < 150) {
            steer.subVectors(target, this.position);
            steer.multiplyScalar(1 * amount / distance);
        }
        return steer;
        //console.log("reach center");
    };
    this.alignment = function (boids) {
        var boid, velSum = new THREE.Vector3(),
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
        var boid, distance, posSum = new THREE.Vector3(),
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
        var boid, distance, posSum = new THREE.Vector3(),
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
    }
}

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = 1.0 * window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var camera, scene, renderer, birds, bird;
var boid, boids;


init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
    camera.position.z = 300;
    scene = new THREE.Scene();
    birds = [];
    boids = [];
    for (var i = 0; i < 256; i++) {
        boid = boids[i] = new Boid();
        boid.position.x = Math.random() * 400 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 300 - 150;
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls(true);
        boid.setWorldSize(500, 500, 400);
        //boid.setWorldSize(100, 100, 40);
        bird = birds[i] = new THREE.Mesh(new Bird(), new THREE.MeshBasicMaterial({
            color: birdsColor,
            //, side: THREE.DoubleSide
        }));
        bird.phase = Math.floor(Math.random() * 62.83);
        scene.add(bird);
    }
    renderer = new THREE.CanvasRenderer({
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

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


var compassID = document.getElementById("compass-nav").style;
var compassAngle = 0;

function map(n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
};


function onDocumentMouseMove(event) {
    var vector = new THREE.Vector3(event.clientX - SCREEN_WIDTH_HALF, -event.clientY + SCREEN_HEIGHT_HALF, 0);
    //var vector1 = new THREE.Vector3(event.clientX - SCREEN_WIDTH_HALF, -event.clientY + SCREEN_HEIGHT_HALF, 0);

    for (var i = 0, il = boids.length; i < il; i++) {
        boid = boids[i];
        vector.z = boid.position.z;
        //boid.repulse(vector);
        //boid.reach(vector,10000.0);

//        if (vector.z < 0) {
            boid.setGoal(vector);
//        }
    }

    compassAngle = map(event.clientX, 0, SCREEN_WIDTH, -45, 45);

    compassID.transform = "rotate(" + compassAngle + "deg)";
    compassID.webkitTransform = "rotate(" + compassAngle + "deg)";
    //console.log(vector);

}



var dispersing = false;
var centerVec = new THREE.Vector3(SCREEN_WIDTH_HALF * 2, SCREEN_HEIGHT_HALF, 0);

function disperseBirds() {
    dispersing = true;
    //var vector =centerVec;
    for (var i = 0, il = boids.length; i < il; i++) {
        boid = boids[i];
        centerVec.z = boid.position.z;
        //boid.disperse(centerVec);
        //boid.burst(centerVec, 100);
        boid.burst();
    }
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {


    for (var i = 0, il = birds.length; i < il; i++) {
        boid = boids[i];
        boid.run(boids);
        if (dispersing) {
            boid.disperse(centerVec);
        }
        bird = birds[i];
        bird.position.copy(boids[i].position);

        color = bird.material.color;
        // color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;
        bird.material.opacity = (500 - bird.position.z) / 1000;
        bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
        bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
        bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
        //  bird.geometry.vertices[5].y = bird.geometry.vertices[4].y = Math.sin(bird.phase) * 5;
    }
    renderer.render(scene, camera);
}
