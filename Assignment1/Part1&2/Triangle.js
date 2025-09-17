// Helper function to build buffers for float data type.
function createBindDataBufferFloat(data){
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

// Helper function to build buffers for int data type.
function createBindDataBufferInt(data){
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
}

// Helper function to create shaders.
function createShader(type, shaderCode){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);
    return shader;
}

//Helper function to compile, link, and use shader programs.
function createShaderProgram(vertShaderCode, fragShaderCode){
    // Intitializing vertex and fragment shaders.
    var vertShader = createShader(gl.VERTEX_SHADER, vertShaderCode);
    var fragShader = createShader(gl.FRAGMENT_SHADER, fragShaderCode);

    // Building shader program.
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    return shaderProgram;
}

// Vertex positions (6 vertices for 2 triangles)
var vertices = [
    -0.9, 0.5, 0.0,
    -0.9, -0.9, 0.0,
    0.5, -0.9, 0.0,
    0.9, -0.5, 0.0,
    0.9, 0.9, 0.0,
    -0.5, 0.9, 0.0
    ]; 

// Randomly scaling the size of the triangle.
// Everytime the page is refreshed.
var sizeScale = Math.random() + 0.5;
var scaledVertices = [];
for (let i = 0; i < vertices.length; i += 3){
    scaledVertices.push(vertices[i] * sizeScale, vertices[i+1] * sizeScale, vertices[i+2] * sizeScale);
}

// Indices for two triangles
var indices = [0, 1, 2, 3, 4, 5];

// Color for each vertex (RGB)
// First triangle: red, green, blue
// Second triangle: yellow, cyan, magenta
var colors = [
    1.0, 0.0, 0.0, // red
    0.0, 1.0, 0.0, // green
    0.0, 0.0, 1.0, // blue
    1.0, 1.0, 0.0, // yellow
    0.0, 1.0, 1.0, // cyan
    1.0, 0.0, 1.0  // magenta
    ];

// Vertex buffer
var vertex_buffer = createBindDataBufferFloat(scaledVertices);

// Color buffer
var color_buffer = createBindDataBufferFloat(colors);

// Index buffer
var Index_Buffer = createBindDataBufferInt(indices);

// Vertex shader
var vertCode =
    'attribute vec3 coordinates;' +
    'attribute vec3 color;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates, 1.0);' +
    ' vColor = color;' +
    '}';

// Fragment shader
var fragCode =
    'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    ' gl_FragColor = vec4(vColor, 1.0);' +
    '}';

// Shader program
var shaderProgram = createShaderProgram(vertCode, fragCode);

// Bind vertex buffer and set attribute
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
var coord = gl.getAttribLocation(shaderProgram, "coordinates");
gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

// Bind color buffer and set attribute
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);

// Bind index buffer
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

// Draw
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);