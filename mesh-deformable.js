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

var t = 0;
var xClick =0;
var yClick =0;
var isDrawing = false;

var mouseX, mouseY;

const twoPointsDraw = {
  vertices: 
  [
    0.0,  0.2,  -22.0, 
    0.5,  -0.5,  -22.0, 
  ],
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
  ],
  indices: [    
    0,  1,                  
  ],
  indexCount: 2,
  primitiveType: POINTS ,
}

const rectangleVerticesDraw = {
  vertices: getRectangleVertices( twoPointsDraw.vertices[0],twoPointsDraw.vertices[1],twoPointsDraw.vertices[2],
                                 twoPointsDraw.vertices[3],twoPointsDraw.vertices[4],twoPointsDraw.vertices[5],), 
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,  1.0,
    1.0,  1.0,  0.0,  1.0,
  ],
  indices: [    
    0,  1,  2,  3               
  ],
  indexCount: 4,
  primitiveType: POINTS ,
  
}

const rectangleLinesDraw = {
  vertices: getRectangleVertices( twoPointsDraw.vertices[0],twoPointsDraw.vertices[1],twoPointsDraw.vertices[2],
                                 twoPointsDraw.vertices[3],twoPointsDraw.vertices[4],twoPointsDraw.vertices[5],), 
  colors: [
    1.0,  0.0,  1.0,  1.0,
    0.0,  1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,  1.0,
    1.0,  1.0,  0.0,  1.0,
  ],
  indices: [    
    0,  1,  3,  2,              
  ],
  indexCount: 4,
  primitiveType: LINE_LOOP ,
  
}


// To test the click
const pointDraw = {
  vertices: 
  [
    0.0,  0.2,  -22.0, 
  ],
  colors: [
    1.0,  0.0,  1.0,  1.0,
  ],
  indices: [    
    0,                     
  ],
  indexCount: 1,
  primitiveType: POINTS ,
}

main();

//
// Start here
// 2:
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now
  
  
  gl.canvas.addEventListener("mousemove", function mousePos (event)
                             {
    // isDrawing = true;
    xMouse = 2*event.clientX/gl.canvas.width-1;
    yMouse = 2*(gl.canvas.height-event.clientY)/gl.canvas.height-1;
  });  

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  
   function setEndVertex (event)
      {
       
        isDrawing = true;
        xClick2 = 2*event.clientX/gl.canvas.width-1;
        yClick2 = 2*(gl.canvas.height-event.clientY)/gl.canvas.height-1;
        
        //console.log("drawing "+ xClick2 +";"+ yClick2);

        shapeDraw.vertices[3] = xClick2;
        shapeDraw.vertices[4] = yClick1;

        shapeDraw.vertices[6] = xClick1;
        shapeDraw.vertices[7] = yClick2;

        shapeDraw.vertices[9] = xClick2;
        shapeDraw.vertices[10] = yClick2;    
      }
  

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      gl_PointSize = 5.0;
    }
  `;
  // Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
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
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    shapeDraw = rectangleLinesDraw;  
    xClick1 = shapeDraw.vertices[0];
    yClick1 = shapeDraw.vertices[1];

    if(isDrawing)   
    {
      gl.canvas.addEventListener("mousemove", setEndVertex);  
    }   
    else
    {
      gl.canvas.addEventListener("mousedown", function (event)
                                 {
        //xClick1 = 2*event.clientX/gl.canvas.width-1;
        //yClick1 = 2*(gl.canvas.height-event.clientY)/gl.canvas.height-1;

        //xClick1 = shapeDraw.vertices[0];
        //yClick1 = shapeDraw.vertices[1];  
        isDrawing = true;
      });  
    }

    gl.canvas.addEventListener("mouseup", function (event)
    {
      isDrawing = false;  
      gl.canvas.removeEventListener("mousemove", setEndVertex);   
    });  

    drawScene(gl, shadersInfo, deltaTime, rectangleLinesDraw);

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

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  /*mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
      //TODO en el bus             
  */
      
  
  mat4.ortho(projectionMatrix,
                 -1,1, //Left Right
                 -1,1, //Top Bottom
                 zNear,
                 zFar);
  

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();
  
  /*mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0,0,-10]);  // amount to */
  
  drawControlPoint(gl, shadersInfo, shapeData);

 
  gl.useProgram(shadersInfo.GLSLprogram);

  gl.uniformMatrix4fv(
      shadersInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      shadersInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);


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
function initLinesBuffers(gl, lineData ) {

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);     
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineData.vertices), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineData.colors), gl.STATIC_DRAW); 

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(lineData.indices), gl.STATIC_DRAW);

  return {
    vertices: verticesBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//Draw and set shader uniforms
function drawControlPoint(gl, shadersInfo, lineData)
{
  //@requires ProgramInfo de los shaders...
  
  //Dicho lineData debe estar parametrizado con la interaccion del usuario
  
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

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferLine.indices);
    
  {
    const vertexCount = lineData.indexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    //@relevant El unico draw que habrá buajajaj
    gl.drawElements(lineData.primitiveType, vertexCount, type, offset);
  }
 
    //return modelViewMatrixLastStack;
}


function generateVertexShader()
{
  //TODO return string
}

function generateFragmentShader()
{
  //TODO return string
}


function getRectangleVertices(p1x,p1y,p1z,p2x,p2y,p2z)
{
  
  var ver = [];
  
  ver = ver.concat(p1x,p1y,p1z);
  
  ver = ver.concat(p2x,p1y,p1z);
  
  ver = ver.concat(p1x,p2y,p1z);
  
  ver = ver.concat(p2x,p2y,p2z);
  
  return ver;
  
}