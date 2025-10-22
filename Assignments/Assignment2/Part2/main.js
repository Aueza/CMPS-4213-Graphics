let mat4 = glMatrix.mat4;
// Get WebGL context
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

function getDelta(min, max) {
  return Math.random() * (max - min) + min;
}

// Vertex Shader Code
const vsSource = `
    attribute vec4 a_position;
    uniform mat4 u_matrix;
    void main() {
        gl_Position = u_matrix * a_position;
    }
`;

// Fragment Shader Code
const fsSource = `
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue color
    }
`;

const program = createProgram(vsSource, fsSource);

// Set up buffers for a simple square (2 triangles)
// const vertices = new Float32Array([
//     -0.01, -0.01, 0.0, 1.0,  // Bottom-left
//      0.01, -0.01, 0.0, 1.0,  // Bottom-right
//     -0.01,  0.01, 0.0, 1.0,  // Top-left
//      0.01,  0.01, 0.0, 1.0  // Top-right
// ]);

// Set up buffers for a simple square (2 triangles)
const vertices = new Float32Array([
    -0.05,  0.05, 0.0, 1.0,  // Top-left
    -0.05, -0.05, 0.0, 1.0,  // Bottom-left
     0.05, -0.05, 0.0, 1.0,  // Bottom-right
    
    -0.05,  0.05, 0.0, 1.0,  // Top-left
     0.05,  0.05, 0.0, 1.0,  // Top-right
     0.05, -0.05, 0.0, 1.0,  // Bottom-right
]);

// configure communication with GPU
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Get attribute location and enable it
const positionAttribLocation = gl.getAttribLocation(program, "a_position");
gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribLocation);

// Get uniform location for mat3 and send it to the shader
const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");


function render() {
    // Clear the canvas and draw the rotated square
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0; i < 10; i++){

        // create a model matrix for the square.
        var model = mat4.create();

        // translate the matrix.
        mat4.translate(model, model, [getDelta(-0.8, 0.8), getDelta(-0.8, 0.8), 0]);

        // rotate the matrix.
        angle = getDelta(0, 360) * (Math.PI / 180);
        mat4.rotateZ(model, model, angle);

        // scale the matrix.
        scale_vector = [getDelta(3, 7), getDelta(3, 7), 0];
        mat4.scale(model, model, scale_vector);
        console.log(model);

        // send the model matrix to the shader to be drawn.
        gl.uniformMatrix4fv(matrixUniformLocation, false, model);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); // Draw square (2 triangles)
    }
}

document.getElementById("renderBtn").addEventListener("click", render);