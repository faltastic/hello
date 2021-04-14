"use strict"; // strict html5

var lastX, lastY;
var startTimeSeconds = Date.now()/1000;
var currentTime = 0;
var particleBuffer;
var shaderProgram;

var vertexBufferSize = 65536,
        particleSize = 2 + 2 + 1, // position (vec2), velocity (vec2), timeOfBirth (float)
        particleId = 0;

function bindAttributes(){
    var sizeOfFloat = 4;
    var vertexLocation = gl.getAttribLocation(shaderProgram, "vertex");
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 5*sizeOfFloat, 0);
    var velocityLocation = gl.getAttribLocation(shaderProgram, "velocity");
    gl.enableVertexAttribArray(velocityLocation);
    gl.vertexAttribPointer(velocityLocation, 2, gl.FLOAT, false, 5*sizeOfFloat, 2*sizeOfFloat );
    var timeOfBirthLocation = gl.getAttribLocation(shaderProgram, "timeOfBirth");
    gl.enableVertexAttribArray(timeOfBirthLocation);
    gl.vertexAttribPointer(timeOfBirthLocation, 1, gl.FLOAT, false, 5*sizeOfFloat, 4*sizeOfFloat);
}

function createVertexBufferObject(){
    particleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    var vertices = new Float32Array(vertexBufferSize * particleSize);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    bindAttributes();
}

function emitParticle(x,y,velocityX, velocityY){
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    var data = new Float32Array(5);
    data[0] = x;
    data[1] = y;
    data[2] = velocityX;
    data[3] = velocityY;
    data[4] = currentTime;
    var sizeOfFloat = 4;
    gl.bufferSubData(gl.ARRAY_BUFFER, particleId*particleSize*sizeOfFloat, data);
    particleId = (particleId +1 )%vertexBufferSize;
}

function mouseMoveEvent(e, onlyRead){
    // assumes canvas is in upper left corner
    var x = e.clientX;
    var y = e.clientY;
    // change position to clip coordinates [-1:1]
    x = (x*2 / canvas.width)-1;
    y = (y*2 / canvas.height)-1;
    y = y*-1;// flip the y-axis
    if (!onlyRead){ // only emit particle after click (to keep sane velocity)
        var velocityX = x - lastX;
        var velocityY = y - lastY;
        emitParticle(x,y,velocityX, velocityY);
    }
    lastX = x;
    lastY = y;
}

function mouseDownEvent(e){
    canvas.onmousemove = mouseMoveEvent;
}

function mouseUpEvent(e){
    canvas.onmousemove = null;
}

function draw(){
    currentTime = Date.now()/1000 - startTimeSeconds;
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "currentTime"), currentTime);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, vertexBufferSize);
}

function setupShader(){
    var vertexShaderSrc = document.getElementById('vertexShader').textContent;
    var fragmentShaderSrc = document.getElementById('fragmentShader').textContent;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
    }
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
    }
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
}

var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");
if (!gl){
    // alternative name
    gl = canvas.getContext("experimental-webgl");
}
// make debug context (check glError after each gl-function call)
gl = WebGLDebugUtils.makeDebugContext(gl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
canvas.onmousedown = mouseDownEvent;
canvas.onmouseup = mouseUpEvent;
setupShader();
createVertexBufferObject();
setInterval(draw,16);
