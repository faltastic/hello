if (!Detector.webgl) Detector.addGetWebGLMessage();
var hash = document.location.hash.substr(1);
if (hash) hash = parseInt(hash, 0);
/* TEXTURE WIDTH FOR SIMULATION */
var WIDTH = 32; //32;//hash || 32;
// 16 =256, 32 = 1024 , 64 = 409


var BIRDS = WIDTH * WIDTH;
// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
THREE.BirdGeometry = function () {
    var triangles = BIRDS * 3;
    var points = triangles * 3;
    THREE.BufferGeometry.call(this);
    var vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    var references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
    var birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);
    this.addAttribute('position', vertices);
    this.addAttribute('birdColor', birdColors);
    this.addAttribute('reference', references);
    this.addAttribute('birdVertex', birdVertex);
    // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );
    var v = 0;

    function verts_push() {
        for (var i = 0; i < arguments.length; i++) {
            vertices.array[v++] = arguments[i];
        }
    }
    var wingsSpan = 20;
    for (var f = 0; f < BIRDS; f++) {
        // Body
        verts_push(0, -0, -20, 0, 4, -20, 0, 0, 30);
        // Left Wing
        verts_push(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15);
        // Right Wing
        verts_push(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15);
    }
    for (var v = 0; v < triangles * 3; v++) {
        var i = ~~(v / 3);
        var x = (i % WIDTH) / WIDTH;
        var y = ~~(i / WIDTH) / WIDTH;
        var c = new THREE.Color(0x444444 + ~~(v / 9) / BIRDS * 0x666666);
        birdColors.array[v * 3 + 0] = c.r;
        birdColors.array[v * 3 + 1] = c.g;
        birdColors.array[v * 3 + 2] = c.b;
        references.array[v * 2] = x;
        references.array[v * 2 + 1] = y;
        birdVertex.array[v] = v % 9;
    }
    this.scale(0.2, 0.2, 0.2);
};
THREE.BirdGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
var container, stats;
var camera, scene, renderer, geometry, i, h, color;
var hydra = [];
var mouseX = 0
    , mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var BOUNDS = 800
    , BOUNDS_HALF = BOUNDS / 2;

var last = performance.now();
var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var birdUniforms;
if(window.innerWidth < window.innerHeight){
 // document.getElementById("mobileMenu").style.visibility = 'hidden';
document.getElementById("deskMenu").style.visibility = 'hidden';
    document.getElementById("threeCanvas").innerHTML =' <img src="img/intro-mobile.png" width="100%" height="auto" />'; 
    
     $(function () {
            $('#mobileMenu').slicknav({
                label: ' ' 
            });
        });
}
else{
  //  document.getElementById("deskMenu").style.visibility = 'visible';
    document.getElementById("divmobileMenu").style.visibility = 'hidden';
    smoothScroll.init({
        speed: 1000, // Integer. How fast to complete the scroll in milliseconds
    easing: 'easeOutCubic', // Easing pattern to use
    offset: 0,// Integer. How far to offset the scrolling anchor location in pixels
        
    });
    init();
    animate();
}
function init() {
   // container = document.createElement('div');
   // document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 350;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0A2E63, 100, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth-20, window.innerHeight);
    container = document.getElementById('threeCanvas');
    document.body.appendChild(container);
    
    container.appendChild(renderer.domElement);
    initComputeRenderer();
    stats = new Stats();
    //container.appendChild(stats.dom);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    //
    window.addEventListener('resize', onWindowResize, false);
    
   var effectController = {
        seperation: 30.0
        , alignment: 20.0
        , cohesion: 90.0
        , freedom: 0.75
    };
    //var gui = new dat.GUI();
    var valuesChanger = function () {
        velocityUniforms.seperationDistance.value = effectController.seperation;
        velocityUniforms.alignmentDistance.value = effectController.alignment;
        velocityUniforms.cohesionDistance.value = effectController.cohesion;
        velocityUniforms.freedomFactor.value = effectController.freedom;
    };
    
    valuesChanger();
    /*
    gui.add(effectController, "seperation", 0.0, 100.0, 1.0).onChange(valuesChanger);
    gui.add(effectController, "alignment", 0.0, 100, 0.001).onChange(valuesChanger);
    gui.add(effectController, "cohesion", 0.0, 100, 0.025).onChange(valuesChanger);
    gui.close();*/
    initBirds();
    
    
    // Center Hedron
    var icosahedron = new THREE.IcosahedronBufferGeometry(70, 1);
    
    var hydraStroke = new THREE.MeshBasicMaterial({
        color: 0xFF4400
        , wireframe: true
        , wireframeLinewidth: 1.3
        //,transparent: false
       //,morphTargets: true
    });
     var hydraFill = new THREE.MeshBasicMaterial({      
         color: 0x0A2E63
    
    });
    
    hydra[0] = new THREE.Mesh(icosahedron, hydraStroke); 
    hydra[0].position.x = 0;
    hydra[0].position.y = 50;
    hydra[0].position.y =10;
    hydra[0].position.z = 100;
    hydra[0].userData = {
           URL: "http://google.com"

    };
    hydra[1] = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(69.5, 1), hydraFill);
     
    hydra[1].position.x = 0;
    hydra[1].position.y = 50;
    hydra[1].position.y = 10;
    hydra[1].position.z = 100;
    scene.add(hydra[1]);

    scene.add(hydra[0]);

}

function initComputeRenderer() {
    gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();
    fillPositionTexture(dtPosition);
    fillVelocityTexture(dtVelocity);
    velocityVariable = gpuCompute.addVariable("textureVelocity", document.getElementById('fragmentShaderVelocity').textContent, dtVelocity);
    positionVariable = gpuCompute.addVariable("texturePosition", document.getElementById('fragmentShaderPosition').textContent, dtPosition);
    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;
    positionUniforms.time = {
        value: 0.0
    };
    positionUniforms.delta = {
        value: 0.0
    };
    velocityUniforms.time = {
        value: 1.0
    };
    velocityUniforms.delta = {
        value: 0.0
    };
    velocityUniforms.testing = {
        value: 1.0
    };
    velocityUniforms.seperationDistance = {
        value: 1.0
    };
    velocityUniforms.alignmentDistance = {
        value: 1.0
    };
    velocityUniforms.cohesionDistance = {
        value: 1.0
    };
    velocityUniforms.freedomFactor = {
        value: 1.0
    };
    velocityUniforms.predator = {
        value: new THREE.Vector3()
    };
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);
    velocityVariable.wrapS = THREE.RepeatWrapping;
    velocityVariable.wrapT = THREE.RepeatWrapping;
    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;
    var error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }
}

function initBirds() {
    var geometry = new THREE.BirdGeometry();
    // For Vertex and Fragment
    birdUniforms = {
        color: {
            value: new THREE.Color(0xffffff)
        }
        , texturePosition: {
            value: null
        }
        , textureVelocity: {
            value: null
        }
        , time: {
            value: 1.0
        }
        , delta: {
            value: 0.0
        }
    };
    // ShaderMaterial
    var material = new THREE.ShaderMaterial({
        uniforms: birdUniforms
        , vertexShader: document.getElementById('birdVS').textContent
        , fragmentShader: document.getElementById('birdFS').textContent
        , side: THREE.DoubleSide
    });
    birdMesh = new THREE.Mesh(geometry, material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    scene.add(birdMesh);
}

function fillPositionTexture(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() * BOUNDS - BOUNDS_HALF;
        var y = Math.random() * BOUNDS - BOUNDS_HALF;
        var z = Math.random() * BOUNDS - BOUNDS_HALF;
        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = 1;
    }
}

function fillVelocityTexture(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = z * 10;
        theArray[k + 3] = 1;
    }
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    var now = performance.now();
    var delta = (now - last) / 1000;
    if (delta > 1) delta = 1; // safety cap on large deltas
    last = now;
    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    birdUniforms.time.value = now;
    birdUniforms.delta.value = delta;
    velocityUniforms.predator.value.set(0.5 * mouseX / windowHalfX, -0.5 * mouseY / windowHalfY, 0);
    mouseX = 10000;
    mouseY = 10000;
     hydra[1].rotation.y += 0.00251;
    hydra[1].rotation.z += 0.00251;
    hydra[0].rotation.y += 0.00251;
    hydra[0].rotation.z += 0.00251;
   
    gpuCompute.compute();
    birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
    birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;
    renderer.render(scene, camera);
}