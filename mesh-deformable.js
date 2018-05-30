var ui;
var picker;
var gl ;
var zFace1 = -10.0;
var zFace2 = -5.0;
var xFace1 = 1.0;
var xFace2 = 3.0;
var eye = vec3.fromValues(3,3,3);
var ctr = vec3.fromValues(0.0, 0.0, zFace1);
var angleX = Math.PI/6;
var angleY = 0 ;//*Math.Pi/4;
var zoomZ = 1.5;
const canvas = document.querySelector('#glcanvas');
var showPickImg = document.querySelector('#pickImg');
var zoomSlider = document.querySelector('#zoom');

const n = 10; 
var offScreen = false;

var timeParameter = 0.0;
var rotYSpeed = 2;
var transSpeed = 0.001;
const POINTS  = 0x0000;
const  LINES          = 0x0001;
const  LINE_LOOP      = 0x0002;
const  LINE_STRIP     = 0x0003;
const  TRIANGLES      = 0x0004;
const  TRIANGLE_STRIP = 0x0005;
const  TRIANGLE_FAN   = 0x0006;

var perspectiveType = "perspective";
var clicTool = "2ndClic";//"cameraClic";//"2ndClic";  //3rdVertex
var primitivesShowed = "faces";//"edges";
var zoom = 1;

var t = 0;
var xClick =0;
var yClick =0;
var isDrawing = false;
var zDragFactor = 2;


var orthoWidth = 10, orthoHeight = 10;
const FOV = 55 * Math.PI / 180;   // in radians
const zNear = 0.1;
const zFar = 100.0;

var mouseX, mouseY;
var shapeDraw, primitivesDrawn;

const threePointsDraw = {
  vertices: 
  [
    xFace1,  1.0,   zFace1, 
    xFace2,  -2.5,  zFace1,
    xFace2,  -2.5,  zFace2, 
  ],
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
    0.0,  1.0,  0.0,  1.0,
  ],
  indices: [    
    0,  1,  2,                 
  ],
  indexCount: 3,
  primitiveType: POINTS ,
}

//check the eight vertices of a cube
const cubePointsDraw = {
  vertices: getCubeVertices( threePointsDraw.vertices[0],threePointsDraw.vertices[1],threePointsDraw.vertices[2],            threePointsDraw.vertices[3],threePointsDraw.vertices[4],threePointsDraw.vertices[5],
   threePointsDraw.vertices[8],), 
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
    0.5,  0.0,  1.0,  1.0,
    1.0,  1.0,  1.0,  1.0,
    
    1.0,  0.0,  0.0,  1.0,
    0.0,  1.0,  0.0,  1.0,
    1.0,  1.0,  0.0,  1.0,
    0.0,  0.0,  1.0,  1.0,
  ],
    pickColors: [
      0.78,0.85,0.51,1.0,
      0.14,0.79,0.51,1.0,
      0.03,0.98,0.59,1.0,
      0.25,0.81,0.41,1.0,
      
      0.57,0.17,0.55,1.0,
      0.55,0.68,0.94,1.0,
      0.3, 0.26,0.42,1.0,
      0.66,0.46,0.81,1.0,
  ],
  indices: [    
    0,  1,  3,  2,  4, 5, 6, 7,            
  ],
  indexCount: 8,
  primitiveType: POINTS, //LINE_LOOP ,
}

//draw the 12 lines of a cube
const cubeLinesDraw = {
  /*vertices: getCubeVertices( threePointsDraw.vertices[0],threePointsDraw.vertices[1],threePointsDraw.vertices[2],            threePointsDraw.vertices[3],threePointsDraw.vertices[4],threePointsDraw.vertices[5],
   threePointsDraw.vertices[8],), 
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
    0.5,  0.0,  1.0,  1.0,
    1.0,  1.0,  1.0,  1.0,
    
    1.0,  0.0,  0.0,  1.0,
    0.0,  1.0,  0.0,  1.0,
    1.0,  1.0,  0.0,  1.0,
    0.0,  0.0,  1.0,  1.0,
  ],
   pickColors: [
      0.78,0.85,0.51,1.0,
      0.14,0.79,0.51,1.0,
      0.03,0.98,0.59,1.0,
      0.25,0.81,0.41,1.0,
      
      0.57,0.17,0.55,1.0,
      0.55,0.68,0.94,1.0,
      0.3, 0.26,0.42,1.0,
      0.66,0.46,0.81,1.0,
  ],*/
  
  indices: [    
    0,  1,  2,  3,     1, 3, 2, 0,
    4,  5, 6, 7,       4, 6, 5, 7,    
    0, 4, 1, 5,        2, 6, 3, 7,        
  ],
  indexCount: 24,
  
  primitiveType: LINES, //LINE_LOOP ,
}


const cubeTrianglesDraw = {
  
  indices: [    
   0,1,2,	1,2,3,
  1,5,3,	5,3,7,
  4,5,6,	5,6,7,
  0,4,2,	4,2,6,
  0,1,4,	1,4,5,
  2,3,6,	3,6,7,	       
  ],
  indexCount: 36,
  
  primitiveType: TRIANGLES, //LINE_LOOP ,
}


var Floor = {
    alias       : 'floor',
    wireframe   : true,
    dim         : 50,
    lines       : 50,
    vertices    : [],
    indices     : [],
    colors     : [],
  pickColors     : [],
    diffuse : [0.7,0.7,0.7,1.0],
    indexCount: 300,
    primitiveType: LINES,
    build : function(d,e){
                    if (d) Floor.dim = d;
                    if (e) Floor.lines = 2*Floor.dim/e;
                    var inc = 2*Floor.dim/Floor.lines;
                    var v = [];
                    var i = [];
                    var c = [];
                    var dif = 0.7;

                    for(var l=0;l<=Floor.lines;l++){
                        v[6*l] = -Floor.dim; 
                        v[6*l+1] = 0;
                        v[6*l+2] = -Floor.dim+(l*inc);
                        
                        v[6*l+3] = Floor.dim;
                        v[6*l+4] = 0;
                        v[6*l+5] = -Floor.dim+(l*inc);
                        
                        v[6*(Floor.lines+1)+6*l] = -Floor.dim+(l*inc); 
                        v[6*(Floor.lines+1)+6*l+1] = 0;
                        v[6*(Floor.lines+1)+6*l+2] = -Floor.dim;
                        
                        v[6*(Floor.lines+1)+6*l+3] = -Floor.dim+(l*inc);
                        v[6*(Floor.lines+1)+6*l+4] = 0;
                        v[6*(Floor.lines+1)+6*l+5] = Floor.dim;
                        
                        i[2*l] = 2*l;
                        i[2*l+1] = 2*l+1;
                        i[2*(Floor.lines+1)+2*l] = 2*(Floor.lines+1)+2*l;
                        i[2*(Floor.lines+1)+2*l+1] = 2*(Floor.lines+1)+2*l+1;        
                      
                        c= c.concat(dif,dif,dif,1.0) ;
                        c= c.concat(dif,dif,dif,1.0) ;
                        c= c.concat(dif,dif,dif,1.0) ;
                        c= c.concat(dif,dif,dif,1.0) ;
                    }
                    Floor.vertices = v;
                    Floor.indices = i;
                    Floor.colors = c;
      Floor.pickColors = c;
              }
}

/*
const sphereProperties = {  
  data: calculateVerticesSphere(1, n),
  indexCount: 6*n*n,
  primitiveType: TRIANGLES ,
  textureImg: 'http://i.imgur.com/vGbKR7M.png',
  
}

const coneProperties = {  
  data: calculateVerticesCone(1, 1.4, n),
  indexCount: n + 2 , 
  primitiveType: TRIANGLE_FAN ,
  textureImg: 'https://images-na.ssl-images-amazon.com/images/I/71g7BoShMQL._SY355_.jpg',
  
}*/

$(document).ready(
  
  function()
		{		$("input").click(function ()  {	
        
        perspectiveType = $('input:radio[name=camera_perspective]:checked').val();
        clicTool = $('input:radio[name=order_clic]:checked').val();
        primitivesShowed = $('input:radio[name=primitives]:checked').val();
        //valueZoom = $('input:range[name=zoom]').val();

        //figureSelected = $('input:radio[name=camera_figure]:checked').val();
        
			  //alert( clicTool +'-' + perspectiveType + primitivesShowed  +valueZoom);			 
			}   );
     
   /*  $('input:range').slider({
    change: function(event, ui) { 
        alert(ui.value); 
        console.log(ui.value +"esto escogido");
    } 
})*/
     
		 }
);


main();

//
// Start here
// 2:
function main() {
  
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  //window.onload from 2:
    
  
  // If we don't have a GL context, give up now
  if (!gl) {
   // alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }


  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec4 aPickColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform bool uOffscreen;

    varying lowp vec4 vColor;
    varying lowp vec4 vPickColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      vPickColor = aPickColor;

      if(uOffscreen){
          gl_PointSize = 20.0;
      }
      else {
        gl_PointSize = 7.0;
      }
    }
  `;
  // Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;
    varying lowp vec4 vPickColor;

    uniform bool uOffscreen;
    uniform highp vec4 uDiffuseColor;
   uniform bool uWireframe;


    void main(void) {
        if(uOffscreen){
            gl_FragColor = vPickColor ;
            return;
        }
         if(uWireframe){
              gl_FragColor = vec4(0.05,0.05,0.05,0.0);
              return;
        }
        
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = loadShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const shadersInfo = {
    GLSLprogram: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      vertexPickColor: gl.getAttribLocation(shaderProgram, 'aPickColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uOffscreen: gl.getUniformLocation(shaderProgram, 'uOffscreen'),
      //uDiffuse: gl.getUniformLocation(shaderProgram, 'uDiffuseColor'),
      uWireframe: gl.getUniformLocation(shaderProgram, 'uWireframe'),

    },
  };

  var then = 0;
  ui = new UI();
  picker = new Picker(); //debugaca
    Floor.build(80,2);

  

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    shapeDraw = cubePointsDraw;

    //if(primitivesShowed == "points"){
      //shapeDraw = cubePointsDraw;  }
    if(primitivesShowed == "edges"){
      //cubeLinesDraw.vertices = cubePointsDraw.vertices;
      //shapeDraw = cubePointsDraw;
    primitivesDrawn = cubeLinesDraw; }
   else if(primitivesShowed == "faces"){
      //cubeTrianglesDraw.vertices = cubePointsDraw.vertices;
      //shapeDraw = cubePointsDraw;
    primitivesDrawn = cubeTrianglesDraw;}
   // else if(primitivesShowed == "faces")
      //shapeDraw = cubeFacesDraw; //TODO
    
    xClick1 = shapeDraw.vertices[0];
    yClick1 = shapeDraw.vertices[1];
        
    const pickBuffers = initFrameBuffer(gl);
    
    /* document.onmousedown = function(event) {
        readPixel(event);
    }*/

    //funcion que actualiza la posicion de la camara
    tick(now);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuffers.frameBuffer);
    offScreen = true;
    gl.uniform1i(shadersInfo.uniformLocations.uOffscreen, offScreen);
    drawScene(gl, shadersInfo, deltaTime,  shapeDraw);
    
    offScreen = showPickImg.checked;
    gl.uniform1i(shadersInfo.uniformLocations.uOffscreen, offScreen); 
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); //pinte pantalla normal
    drawScene(gl, shadersInfo, deltaTime, shapeDraw);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, shadersInfo, deltaTime, shapeData) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
  drawControlPoint(gl, shadersInfo, shapeData);

  gl.useProgram(shadersInfo.GLSLprogram);

  gl.uniformMatrix4fv(
      shadersInfo.uniformLocations.projectionMatrix,
      false,
      ui.projection);
  gl.uniformMatrix4fv(
      shadersInfo.uniformLocations.modelViewMatrix,
      false,
      ui.modelview);


  timeParameter += deltaTime;
  
  t += deltaTime;

}

//
// Initialize a shader program, so WebGL knows how to draw our data
// 3:
function loadShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
// 4:
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// 5: just initBuffers, receives data as @param
function initLinesBuffers(gl, shapeData) {
  
  var indicesDrawn, auxIndicesDrawn;
  
  if(!offScreen)
    indicesDrawn = shapeData.indices;
  else
    indicesDrawn = cubePointsDraw.indices;
   

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);     
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeData.vertices), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeData.colors), gl.STATIC_DRAW); 
  
    const pickColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeData.pickColors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesDrawn), gl.STATIC_DRAW);
  
    const indicesDrawnBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesDrawnBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array( primitivesDrawn.indices), gl.STATIC_DRAW);


  return {
    vertices: verticesBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    pickcolors: pickColorBuffer,
    showedIndices: indicesDrawnBuffer,
  };
}

//6: Draw and set shader uniforms
function drawControlPoint(gl, shadersInfo, lineData)
{
  //@requires ProgramInfo de los shaders...
  
  //Dicho lineData debe estar parametrizado con la interaccion del usuario
  
  
    gl.uniform1i(
      shadersInfo.uniformLocations.uWireframe,
      lineData.wireframe);
  
  
  var bufferLine = initLinesBuffers(gl, lineData );  
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine.vertices);
    gl.vertexAttribPointer(
        shadersInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        shadersInfo.attribLocations.vertexPosition);
  }
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine.color);
    gl.vertexAttribPointer(
        shadersInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        shadersInfo.attribLocations.vertexColor);
  }
  
  // NEW pickColors
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine.pickcolors);
    gl.vertexAttribPointer(
        shadersInfo.attribLocations.vertexPickColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        shadersInfo.attribLocations.vertexPickColor);
  }


  // Draw Always the vertices points
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferLine.indices);
  {  
    {
      var vertexCount = lineData.indexCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(lineData.primitiveType, vertexCount, type, offset);
    }
  }
  
  //Figures showed 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferLine.showedIndices);
  
 if(!offScreen)
  {
    {
      var vertexCount = primitivesDrawn.indexCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(primitivesDrawn.primitiveType, vertexCount, type, offset);
    }
    
  }
 
  
  
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////Floor /////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  
    drawFloor(shadersInfo);
}


function generateVertexShader()
{
  //TODO return string
}

function generateFragmentShader()
{
  //TODO return string
}


function getCubeVertices(p1x, p1y, p1z,
                              p2x, p2y, p2z,
                              /*p3x, p3y,*/ p3z)
{
  var ver = [];
  
  ver = ver.concat(p1x,p1y,p1z);
  ver = ver.concat(p2x,p1y,p1z);
  ver = ver.concat(p1x,p2y,p1z);
  ver = ver.concat(p2x,p2y,p2z);
  ver = ver.concat(p1x,p1y,p3z);
  ver = ver.concat(p2x,p1y,p3z);
  ver = ver.concat(p1x,p2y,p3z);
  ver = ver.concat(p2x,p2y,p3z);
  
  return ver;
}

//7:
// De {-1, 1} x {-1, 1}
function canvasMouseNormalizedPos(event) {
  var xOffset = 0.0000000028; 
      
  var x = 2*event.clientX/gl.canvas.width-1 -xOffset;
  var y = 2*(gl.canvas.height-event.clientY)/gl.canvas.height-1;
  //console.log(x, y);
      
  return {
    x: x,
    y: y,
  }
}

// 3:
function elementPos(element) {
  var x = 0, y = 0;
  while(element.offsetParent) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

/** drmayor
* retorna la posicion del clic dentro del canvas
* 5:
**/
function canvasMousePos(event) {
  
  //mouse location en el html template
  var mousePosx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                                                              //ok si, scroll necesario
  var mousePosy =  event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  
  var canvasPos = elementPos(canvas);
  
  var x= mousePosx - canvasPos.x;
  var y= mousePosy - canvasPos.y;
  
  //console.log(x, y);
  return {
    x: x,
    y: y,
  };
  //@dep 3; 4
}

/** drmayor
*  Actualización de cada frame (no linealmente sino desde la última actualización)
*  0:      Actualiza (y determina) la ubicación de la cámara (eye)
**/
function tick(timeSinceStart) {
  var rad = 5;
  eye[0] =  rad * zoomZ * Math.sin(angleY) * Math.cos(angleX);
  eye[1] = rad * zoomZ * Math.sin(angleX);
  eye[2] = rad * zoomZ * Math.cos(angleY) * Math.cos(angleX);  

  ui.update(timeSinceStart);
  //ui.render();
  
  //UI7, (R4), UI3, 
}

// ------- UI --------------------------------------

// Clase del Path tracing - https://github.com/evanw/webgl-path-tracing

//UI1:
function UI() {
  //this.renderer = new Renderer();
  this.moving = false;
  this.modelview = mat4.create();
  this.projection = mat4.create();
  this.modelViewProjection =  mat4.create();
  
}

//UI3: !!! Actualiza la camara!!!!!
UI.prototype.update = function(timeSinceStart) {
  mat4.lookAt(this.modelview, 
                vec3.fromValues(eye[0], eye[1], eye[2]), 
                vec3.fromValues(ctr[0], ctr[1], ctr[2]) , 
                vec3.fromValues(0, 1, 0));
  
  if(perspectiveType == "perspective")
    mat4.perspective(this.projection, FOV, gl.canvas.clientWidth / gl.canvas.clientHeight, zNear, zFar);
  else if(perspectiveType == "orthogonal"){
    mat4.ortho(this.projection, -orthoWidth/2,orthoWidth/2,  -orthoHeight/2,orthoHeight/2, zNear, zFar);
  }
  mat4.multiply(this.modelViewProjection, this.projection, this.modelview);
  //  this.renderer.update(this.modelviewProjection, timeSinceStart);
  //@dep R3
};

//6: 
var mouseDown = false, oldX, oldY;
var selectDown = false;

//TODO para diferenciar entre 2nd, 3rd o move camra
document.onmousedown = function(event) {
  var mouse = canvasMousePos(event);
  var mouseNorm = canvasMouseNormalizedPos(event);
  oldX = mouse.x;
  oldY = mouse.y;
  //   if(mouse.x >=  0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {

  if (event.which == 3)
  //if(clicTool == "cameraClic")  //separa cualquier instruccin de mover camara, y lo hizo por coincidencia :P
  {
    mouseDown = true; //!ui.mouseDown(mouse.x, mouse.y);
  }
  /*else if(clicTool == "selectClic")  
  {
    selectDown = true; //!ui.mouseDown(mouse.x, mouse.y);
    //var readout = readPixel(event);
    findPicked(event);
  }*/
  else
  {
    ui.mouseDown(mouseNorm.x, mouseNorm.y);
  }
    
  //     // disable selection because dragging is used for rotating the camera and moving objects
  //     return false;
  //   }

  return true;

  //@dep 5, ui4
};

/** drmayor 
* 7:
**/
document.onmousemove = function(event) {
  var mouse = canvasMousePos(event);
  

  if(mouseDown) {
    // update the angles based on how far we moved since last time
    //console.log("angles " + angleX, angleY);
    angleY -= (mouse.x - oldX) *0.01 ;
    angleX += (mouse.y - oldY) *0.01;
    
    // no verlo de cabeza
    angleX = Math.max(angleX, -Math.PI / 2 + 0.01);
    angleX = Math.min(angleX, Math.PI / 2 - 0.01);
    
    oldX = mouse.x;
    oldY = mouse.y;
  } 
 /* else {
    //var canvasPos = elementPos(canvas);
    var mouseNorm = canvasMouseNormalizedPos(event);
    ui.mouseMove(mouseNorm.x, mouseNorm.y);
  }*/
  
  
  //@dep 3, 5, UI5
};

/** drmayor
* Al soltar el clic, dejar quieta la camara
* 8:
**/
document.onmouseup = function(event) {
  mouseDown = false;
  isDrawing = false; 

  var mouse = canvasMousePos(event);
  
  //ui.mouseUp(mouse.x, mouse.y);
    //@dep 5, UI6
  
  if(clicTool == "selectClic")
  {
    gl.canvas.removeEventListener("mousemove", movePickVertex);   
  } 
  if(clicTool == "2ndClic")
  {
    gl.canvas.removeEventListener("mousemove", setEndVertex);   
  } 
  else if(clicTool == "3rdClic")
  {
    gl.canvas.removeEventListener("mousemove", set3rdVertex);   
  } 
  deseleccionar();


    
  
}
  
//Eyeray to clic pos vector in 3D world
//U1:
function getEyeRay(invMVP, x, y) {
  
  var rayMatrix = mat4.create();
  rayMatrix[0] = x;   rayMatrix[1] = y;  rayMatrix[2] = 0;  rayMatrix[3] = 1;  
  mat4.multiply(invMVP, invMVP, rayMatrix);  
  
  //solo queremos el vector
  var eyeRay = vec4.fromValues(invMVP[0],invMVP[1], invMVP[2], invMVP[3]);
  
  eyeRay  = divideByW(eyeRay);  
  var v3 = vec3.create();
  
  vec3.subtract( v3, vec3.fromValues(eyeRay[0], eyeRay[1], eyeRay[2]),  eye);
  
  return v3;
  
  //@dep V1,V3
}


function divideByW( vec ) {
  var w = vec [vec.length - 1];
  return vec4.fromValues(vec[0]/w, vec[1]/w, vec[2]/w, vec[3]/w);
}

/** drmayor
* UI4: Intersección del rayo de clic con un objeto del canvas
**/
UI.prototype.mouseDown = function(x, y) {
  
  isDrawing = true; 
  
 //if(clicTool == "1stClic")   {} //TODO
  findPicked(event);
   if(clicTool == "selectClic")
  {
    gl.canvas.addEventListener("mousemove", movePickVertex);   
  } 
  
  else if(clicTool == "2ndClic")
  {  
    gl.canvas.addEventListener("mousemove", setEndVertex);  
   // return this.eyeRayClicPlane(x, y);
  }
  else if(clicTool == "3rdClic")
  {
    gl.canvas.addEventListener("mousemove", set3rdVertex);  
    //return this.eyeRayClicPlane(x, y);
  }
  
};

//UI5: move plane in the same plane
UI.prototype.eyeRayClicPlane = function(x, y) {
  
  var t ;
  var origin = eye;
  var invMVP = mat4.create();
  mat4.invert(invMVP,this.modelViewProjection);
  var ray = getEyeRay(invMVP,  x , y ); 
 
  //https://www.uv.mx/personal/aherrera/files/2014/05/09-Interseccion-de-una-Recta-y-un-Plano-en-3D.pdf
  this.surfaceNormal = vec3.fromValues(0, 0, 1.0);  
  this.surfaceConstraint = zFace2 ; //el plano Z 
  
  var denom = vec3.dot(this.surfaceNormal, ray);
  t =  (this.surfaceConstraint - vec3.dot(this.surfaceNormal, origin)) / denom;
 
  var hit = vec3.create();
  vec3.scale(ray, ray, t);
  vec3.add(hit, origin, ray);
  
  return hit;
  
};

// UI6: move point through normal plane from eyeRay
UI.prototype.eyeRayPickObj = function(x, y) {
  
  var t ;
  var origin = eye;
  var invMVP = mat4.create();
  mat4.invert(invMVP,this.modelViewProjection);
  var ray = getEyeRay(invMVP,  x , y ); 
 
  var pick = picker.getPickPos();
  var d = ray[0]*pick[0] + ray[1]*pick[1] + ray[2]*pick[2];
  
  this.surfaceNormal =  ray ; // el mismo ray para moverlo ortogonal a la vista;   
  this.surfaceConstraint = d ; 
  
  var denom = vec3.dot(this.surfaceNormal, ray);
  t =  (this.surfaceConstraint - vec3.dot(this.surfaceNormal, origin)) / denom;
 
  var hit = vec3.create();
  vec3.scale(ray, ray, t);
  vec3.add(hit, origin, ray);
  
  return hit;
  
};


//UI5: move plane in the same plane
UI.prototype.eyeRayExtrudePlane = function(x, y) {
  
  var t ;
  var origin = eye;
  var invMVP = mat4.create();
  mat4.invert(invMVP,this.modelViewProjection);
  var ray = getEyeRay(invMVP,  x , y ); 
 
  //https://www.uv.mx/personal/aherrera/files/2014/05/09-Interseccion-de-una-Recta-y-un-Plano-en-3D.pdf
  this.surfaceNormal = vec3.fromValues(1, 0, 0);  
  this.surfaceConstraint = xFace2 ; //el plano Z 
  
  var denom = vec3.dot(this.surfaceNormal, ray);
  t =  (this.surfaceConstraint - vec3.dot(this.surfaceNormal, origin)) / denom;
 
  var hit = vec3.create();
  vec3.scale(ray, ray, t);
  vec3.add(hit, origin, ray);
  
  return hit;
  
};


//UI7: modifyZoom
zoomSlider.oninput = function() {
  zoomZ = this.value;
  zoomSlider.nodeValue = this.value;
  console.log(zoomZ);
};



 

//Picker Class
//P0
function Picker() {
    this.objI = -1; 
    this.texture = null;
    this.framebuffer = null;
    this.renderbuffer = null;
    this.pickPos = vec3.create();
    
   // this.configure();
 // initFrameBuffer(gl, this);
    
};



//P1:
//var frametexture;
var framebuffer;
 var texture;
function initFrameBuffer(gl)
{

  var width = gl.canvas.clientWidth;
  var height = gl.canvas.clientHeight;

  // //1. Init Picking Texture
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //si quiere comprobar que hay textura
  var pixel = new Uint8Array([255, 0, 255, 255]); 
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  //2. Init Render Buffer
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.clientWidth, gl.canvas.clientHeight);

  //3. Init Frame Buffer
  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); 
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
  //4. Clean up
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return  {
    frameTexture: texture, 
    frameBuffer: framebuffer,
  };
    
  
}

//P2:
function readPixel(event)
{
  
 // var coords = canvasMouseNormalizedPos(event);
  //del framebuffer o de la pantalla 
  //difieres tocando el pixel del zorro
  var readout = new Uint8Array(1 * 1 * 4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.readPixels(event.clientX,gl.canvas.height-event.clientY,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout); 
  //console.log(""+readout);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  return readout;
  
}

//P3:
function comparePick(color, readout)
{
  //resta lo leido por el color. si todos son caSsi 0, es el mismo color
  //   console.info('comparing object '+object.alias+' diffuse ('+Math.round(color[0]*255)+','+Math.round(color[1]*255)+','+Math.round(color[2]*255)+') == readout ('+ readout[0]+','+ readout[1]+','+ readout[2]+')');
    return (
      Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
			Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && 
			Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
}


//P4:
//var iPicked = -1;
// vaya punto por punto hasta que salga uno que si
function findPicked(event)
{
  var readout = readPixel(event);
  
  for(var i=0; i<=cubePointsDraw.pickColors.length; i = i+4)
  {
    var color = [cubePointsDraw.pickColors[i], cubePointsDraw.pickColors[i+1] ,   cubePointsDraw.pickColors[i+2]]; //toDebug

    if(comparePick(color, readout))
    {
      picker.objI = (i/4) + 1;
      console.log("El seleccionado es " + picker.objI);
      
      //colorear el seleccionado
      cubePointsDraw.colors[i+3] = 0.2;

      cubePointsDraw.pickColors[i+3] = 0.2;
      break ;
    }
  }
  
  if( picker.objI == -1)
  {//si no encontro ninguno deseleccione
  cubePointsDraw.pickColors[4*picker.objI-1] = 1.0;
  cubePointsDraw.colors[4*picker.objI-1] = 1.0;

  //return -1;
  }
}


//P5:
function deseleccionar()
{
  //console.log("no encontro ninguno, descoloreo");
  cubePointsDraw.pickColors[4*picker.objI-1] = 1.0;
  cubePointsDraw.colors[4*picker.objI-1] = 1.0;
  picker.objI = -1;
}


//P6:
Picker.prototype.getPickPos =  function()
{
    var vertexI = 3*(this.objI -1) ;
    var pickObjPos = vec3.fromValues( 
        shapeDraw.vertices[vertexI],  shapeDraw.vertices[vertexI+1], shapeDraw.vertices[vertexI+2]) ;
  //console.log(shapeDraw.vertices[vertexI],  shapeDraw.vertices[vertexI+1], shapeDraw.vertices[vertexI+2]);
  
   return pickObjPos;
  
}

/*
function Point(location, pickColor, color, index)
{
  this.location   = location ; //vec3.create();
  this.pickColor  = pickColor ;//vec4.create()
  this.diffuse    = color; //vec4.create()
  this.index    = i;
  
  this.pickColor = [1.0, 0.0, 0.0, 1.0]; //randomize
  
  objs.push(this);
  
}



function Scene()
{
  this.objs = [];
  
  
  
}*/

// Util 1: pintar piso
function drawFloor(shadersInfo)
{

  gl.uniform1i(
    shadersInfo.uniformLocations.uWireframe,
    Floor.wireframe);

  var bufferFloor = initLinesBuffers(gl, Floor );  
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFloor.vertices);
    gl.vertexAttribPointer(
      shadersInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      shadersInfo.attribLocations.vertexPosition);
  }
  // into the vertexColor attribute.
  //if(!lineData.wireframe)     //fll
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFloor.color);
    gl.vertexAttribPointer(
      shadersInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      shadersInfo.attribLocations.vertexColor);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferFloor.pickcolors);
    gl.vertexAttribPointer(
      shadersInfo.attribLocations.vertexPickColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(
      shadersInfo.attribLocations.vertexPickColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferFloor.indices);

  {
    const vertexCount = Floor.indexCount; //50 ;//lineData.indexCount; //250-320 //fll
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(Floor.primitiveType, vertexCount, type, offset);
  }
}


//interaction Functions


// I!:
function movePickVertex (event)
  {
   // isDrawing = true;

    xClick2 = canvasMouseNormalizedPos( event).x ;
    yClick2 = canvasMouseNormalizedPos( event).y ; 

    //console.log("drawing "+ xClick2 +";"+ yClick2);

    if(perspectiveType == "perspective" )
    {
      var pointHit = ui.eyeRayPickObj(xClick2, yClick2); 
      xClick2 = pointHit[0]; ///zShape/tan(FOV/2)
      yClick2 = pointHit[1];
      zClick2 = pointHit[2];
    }
    else if(perspectiveType == "orthogonal" ) //funciona pero no tanto
    {
      xClick2 = xClick2*orthoWidth/2;
      yClick2 = yClick2*orthoHeight/2;
    }

    //console.log(xClick2, yClick2,); 
    //console.log("true pos "+ xClick2 +";"+ yClick2);

    var vertexI = 3*(picker.objI -1) ;

    shapeDraw.vertices[vertexI] = xClick2;
    shapeDraw.vertices[vertexI+1] = yClick2;    
    shapeDraw.vertices[vertexI+2] = zClick2;
  }

 

//I2:
function setEndVertex (event)
  {

    xClick2 = canvasMouseNormalizedPos( event).x ;
    yClick2 = canvasMouseNormalizedPos( event).y ; 

    //console.log("drawing "+ xClick2 +";"+ yClick2);

    if(perspectiveType == "perspective" )
    {
      var pointHit = ui.eyeRayClicPlane(xClick2, yClick2); 
      xClick2 = pointHit[0]; ///zShape/tan(FOV/2)
      yClick2 = pointHit[1];
    }
    else if(perspectiveType == "orthogonal" ) //funciona pero no tanto
    {
      xClick2 = xClick2*orthoWidth/2;
      yClick2 = yClick2*orthoHeight/2;
    }

    console.log(xClick2, yClick2,); 
    //console.log("true pos "+ xClick2 +";"+ yClick2);

    shapeDraw.vertices[3] = xClick2;
    shapeDraw.vertices[4] = yClick1;

    shapeDraw.vertices[6] = xClick1;
    shapeDraw.vertices[7] = yClick2;

    shapeDraw.vertices[9] = xClick2;
    shapeDraw.vertices[10] = yClick2;    

    //Cube
    shapeDraw.vertices[15] = xClick2;
    shapeDraw.vertices[16] = yClick1;

    shapeDraw.vertices[18] = xClick1;
    shapeDraw.vertices[19] = yClick2;

    shapeDraw.vertices[21] = xClick2;
    shapeDraw.vertices[22] = yClick2;    
    
    xFace2 = shapeDraw.vertices[21];
  }


 
//I2: Extrude face through x axis
  function set3rdVertex (event)
  {
   // isDrawing = true;
        
    xClick = canvasMouseNormalizedPos( event).x ;
    yClick = canvasMouseNormalizedPos( event).y ; 
    
    var pointHit = ui.eyeRayExtrudePlane(xClick, yClick); 
    xClick2 = pointHit[0]; ///zShape/tan(FOV/2)
    yClick2 = pointHit[1];
    zClick2 = pointHit[2];

    /*
    shapeDraw.vertices[14] -= yClick*zDragFactor;
    shapeDraw.vertices[17] -=  yClick*zDragFactor;
    shapeDraw.vertices[20] -=  yClick*zDragFactor;
    shapeDraw.vertices[23] -=  yClick*zDragFactor;       */
    
    shapeDraw.vertices[14] = zClick2;
    shapeDraw.vertices[17] =  zClick2;
    shapeDraw.vertices[20] =  zClick2;
    shapeDraw.vertices[23] =  zClick2;  
        
    zFace2 = shapeDraw.vertices[23];

  }
