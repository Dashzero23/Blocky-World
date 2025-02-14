// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
/*Nguyen Vu 
npvu@ucsc.edu*/
var VSHADER_SOURCE = `
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
   }`
// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
       gl_FragColor = u_FragColor;                  // Use color
    } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
    } else if(u_whichTexture == 0){
       gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    } else if(u_whichTexture == 1){
       gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
    } else {
       gl_FragColor = vec4(1,.2,.2,1);              // Error, Red
    }
  }`

// Global variable
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
var u_Sampler1;
var u_whichTexture;

function setupWebGL()
{
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders ==========================================
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
  }

  // Get the storage location of attribute variable ==============
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
  }

  // Get the storage location of attribute variable ==============
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.log('Failed to get u_whichTexture');
      return;
  }

  // Get the storage location of attribute variable ==============
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
      console.log('Failed to get u_FragColor');
      return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
      console.log('Failed to get u_ModelMatrix');
      return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
      console.log('Failed to get u_GlobalRotateMatrix');
      return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
      console.log('Failed to get u_ViewMatrix');
      return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get u_ProjectionMatrix');
      return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

let g_camera;
// UI global
let g_globalAngle = 0;

let headAngle = 0;
let upperAngle = 0;
let lowerAngle = 0;

let headAnim = false;
let legAnim = false;

function addActionsForHtmlUI()
{

  document.getElementById('animHeadOnButton').onclick = function() {headAnim = true};
  document.getElementById('animHeadOffButton').onclick = function() {headAnim = false};

  document.getElementById('leftSlide').addEventListener('mousemove', function() { headAngle = this.value; renderAllShapes(); });
  document.getElementById('upperSlide').addEventListener('mousemove', function() { upperAngle = this.value; renderAllShapes(); });
  document.getElementById('lowerSlide').addEventListener('mousemove', function() { lowerAngle = this.value; renderAllShapes(); });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}

function initTextures() {
  // Create the image object
  var image = new Image();
  if (!image) 
  {
    console.log('Failed to create the image object');
    return false;
  }
  
  // Register the event handler to be called when image loading is completed
  image.onload = function(){ sendTextureToTEXTURE0(image); };
  // Tell the browser to load an Image
  image.src = 'sky.jpg';

  var image1 = new Image();
  if (!image1) 
  {
    console.log('Failed to create the image1 object');
    return false;
  }
  
  // Register the event handler to be called when image loading is completed
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an Image
  image1.src = 'grass.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y axis
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameter
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture)
  {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y axis
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameter
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('finished loadTexture');
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Specify the color for clearing <canvas>
  g_camera = new Camera();
  generateMap();
  document.onkeydown = keydown;
  canvas.onmousemove = function(ev)
  {
    mouseCam(ev);
  }
  initTextures();
  // Clear <canvas>
  gl.clearColor(0.0, 0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

function tick()
{
  g_seconds = performance.now()/1000 - g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles()
{
  if(headAnim)
  {
    headAngle = 15*Math.sin(g_seconds);
  }

  if(legAnim)
  {
    upperAngle = 45*Math.sin(3*g_seconds);
  }  
}

function keydown(ev){
  if(ev.keyCode==39 || ev.keyCode == 68)
  {
    g_camera.right();
  } 
  
  else if (ev.keyCode==37 || ev.keyCode == 65)
  {
    g_camera.left();
  } 
  
  else if (ev.keyCode==38 || ev.keyCode == 87)
  {
    g_camera.forward();
  } 
  
  else if (ev.keyCode==40 || ev.keyCode == 83)
  {
    g_camera.back();
  }

  renderAllShapes();
  //console.log(ev.keyCode);
}

function convertCoordinatesEventToGL(ev)
{
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect() ;

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function mouseCam(ev)
{
  var coord = convertCoordinatesEventToGL(ev);
  var panAngle = coord[0] * 10;

  if (panAngle < 0) {
    g_camera.panLeft(-panAngle);
  } else {
    g_camera.panRight(panAngle);
  }
}

var g_eye = [0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];
var g_map = [];

function generateMap() {
  g_map = []; // Reset map

  for (let x = 0; x < 32; x++) {
    g_map[x] = [];

    for (let z = 0; z < 32; z++) {
      if (x > 13 && x < 18 && z > 13 && z < 18)
      {
        g_map[x][z] = 0; // left an open spot in the middle for the animal
      }

      else 
      {
        g_map[x][z] = Math.random() * 2 - 1 > 0 ? 1 : 0;
      }
    }
  }
}

function drawMap()
{
  for(x=0; x<32; x++)
  {
    for(z=0; z<32; z++)
    {
      if (x == 0 || x == 31 || z == 0 || z == 31)
      {
        let wall = new Cube();
        wall.color = [.80, .70, .40, 1.0];
        wall.matrix.scale(0.5,0.5,0.5);
        wall.matrix.translate(x-8,-.25,z-8);
        wall.renderFast();
      }
      
      else if(g_map[x][z] == 1)
      {
        let wall = new Cube();
        wall.color = [.80, .70, .40, 1.0];
        wall.matrix.scale(0.5,0.5,0.5);
        wall.matrix.translate(x-8,-.25,z-8);
        wall.renderFast();
      }
    }
  }
}

function renderAllShapes()
{
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1],  g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],   g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],   g_camera.up.elements[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  var color = [1, 0.7, 0.8, 1];

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawMap();

  var sky = new Cube();
  sky.textureNum = 0;
  sky.color = [0.68,0.85,0.9,1];
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var ground = new Cube();
  ground.textureNum = 1;
  ground.matrix.translate(-4, -0.2, -4);
  ground.matrix.scale(16, 0.001, 16);
  ground.render();

  var body = new Cube();
  //body.textureNum = 0;
  body.color = [1, 0.7, 0.8, 1];
  body.matrix.translate(-0.2, 0, -0.15);
  body.matrix.scale(0.4, 0.4, 0.7);
  body.renderFast();

  // HEAD
  var head = new Cube();
  head.color = color;
  head.matrix.rotate(-headAngle, 1, 0, 0);
  head.matrix.scale(0.35, 0.35, 0.35);
  head.matrix.translate(-0.5, 0.25, -1.25);
  head.renderFast();

  var leftEye1 = new Cube();
  leftEye1.color = [1, 1, 1, 1];
  leftEye1.matrix.rotate(-headAngle, 1, 0, 0);
  leftEye1.matrix.scale(0.1, 0.05, 0.05);
  leftEye1.matrix.translate(-1.5, 5, -9);
  leftEye1.renderFast();

  var leftEye2 = new Cube();
  leftEye2.color = [0, 0, 0, 1];
  leftEye2.matrix.rotate(-headAngle, 1, 0, 0);
  leftEye2.matrix.scale(0.05, 0.05, 0.05);
  leftEye2.matrix.translate(-3, 5, -9.05);
  leftEye2.renderFast();

  var rightEye1 = new Cube();
  rightEye1.color = [1, 1, 1, 1];
  rightEye1.matrix.rotate(-headAngle, 1, 0, 0);
  rightEye1.matrix.scale(0.1, 0.05, 0.05);
  rightEye1.matrix.translate(0.5, 5, -9);
  rightEye1.renderFast();

  var rightEye2 = new Cube();
  rightEye2.color = [0, 0, 0, 1];
  rightEye2.matrix.rotate(-headAngle, 1, 0, 0);
  rightEye2.matrix.scale(0.05, 0.05, 0.05);
  rightEye2.matrix.translate(2, 5, -9.05);
  rightEye2.renderFast();

  // LEGS
  var frontLeft1 = new Cube();
  frontLeft1.color = color;
  frontLeft1.matrix.rotate(-upperAngle, 1, 0, 0);
  var frontLeftCoord = new Matrix4(frontLeft1.matrix);
  frontLeft1.matrix.scale(0.1, 0.2, 0.1);
  frontLeft1.matrix.translate(-1.15, -0.65, -0.75);
  frontLeft1.renderFast();

  var frontLeft2 = new Cube();
  frontLeft2.color = color;
  frontLeft2.matrix = frontLeftCoord;
  frontLeft2.matrix.rotate(-lowerAngle, 1, 0, 0);
  frontLeft2.matrix.scale(0.11, 0.11, 0.11);
  frontLeft2.matrix.translate(-1.1, -2, -0.7);
  frontLeft2.renderFast();


  var frontRight1 = new Cube();
  frontRight1.color = color;
  frontRight1.matrix.rotate(upperAngle, 1, 0, 0);
  var frontRightCoord = new Matrix4(frontRight1.matrix);
  frontRight1.matrix.scale(0.1, 0.2, 0.1);
  frontRight1.matrix.translate(0.2, -0.65, -0.75);
  frontRight1.renderFast();

  var frontRight2 = new Cube();
  frontRight2.color = color;
  frontRight2.matrix = frontRightCoord;
  frontRight2.matrix.rotate(lowerAngle, 1, 0, 0);
  frontRight2.matrix.scale(0.11, 0.11, 0.11);
  frontRight2.matrix.translate(0.15, -2, -0.7);
  frontRight2.renderFast();

  // Back left rotation is broken for some reason
  var backLeft1 = new Cube();
  backLeft1.color = color;
  //backLeft1.matrix.rotate(upperAngle, 1, 0, 0);
  var backLeftCoord = new Matrix4(backLeft1.matrix);
  backLeft1.matrix.scale(0.1, 0.2, 0.1);
  backLeft1.matrix.translate(-1.15, -0.65, 3);
  backLeft1.renderFast();

  var backLeft2 = new Cube();
  backLeft2.color = color;
  backLeft2.matrix = backLeftCoord;
  //backLeft2.matrix.rotate(-lowerAngle, 1, 0, 0);
  backLeft2.matrix.scale(0.11, 0.11, 0.11);
  backLeft2.matrix.translate(-1.1, -2, 2.7);
  backLeft2.renderFast();


  var backRight1 = new Cube();
  backRight1.color = color;
  //backRight1.matrix.rotate(-upperAngle, 1, 0, 0);
  var backRightCoord = new Matrix4(backRight1.matrix);
  backRight1.matrix.scale(0.1, 0.2, 0.1);
  backRight1.matrix.translate(0.2, -0.65, 3);
  backRight1.renderFast();

  var backRight2 = new Cube();
  backRight2.color = color;
  backRight2.matrix = backRightCoord;
  //backRight2.matrix.rotate(lowerAngle, 1, 0, 0);
  backRight2.matrix.scale(0.11, 0.11, 0.11);
  backRight2.matrix.translate(0.15, -2, 2.7);
  backRight2.renderFast();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}

function sendTextToHTML(text, htmlID)
{
  var htmlElm = document.getElementById(htmlID);

  if (!htmlElm)
  {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;
}
