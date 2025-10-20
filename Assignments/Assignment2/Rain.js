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
    -0.01,  0.01, 0.0, 1.0,  // Top-left
    -0.01, -0.01, 0.0, 1.0,  // Bottom-left
     0.01, -0.01, 0.0, 1.0,  // Bottom-right
    
    -0.01,  0.01, 0.0, 1.0,  // Top-left
     0.01,  0.01, 0.0, 1.0,  // Top-right
     0.01, -0.01, 0.0, 1.0,  // Bottom-right
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

// Define raindrops.
const raindrops = [];
const numRaindrops = 300;
for(let i = 0; i < numRaindrops; i++){
    raindrops.push({
        x: getDelta(-1,1),
        y: getDelta(0.5, 1),
        speed: getDelta(0.01, 0.03)
    })
}

function render() {
    // Clear the canvas and draw the rotated square
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Drawing scene.
    drawScene();

    // Re-bind the rain shader program and buffers
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);
    
    // iterating through each raindrop.
    for(let i = 0; i < raindrops.length; i++){
        // select a raindrop.
        let drop = raindrops[i];

        // update the drop's y position.
        drop.y -= drop.speed;
        if(drop.y < -1){
            // if the drop is off the screen.
            // reset it to the top.
            drop.y = 1;
            drop.x = getDelta(-1, 1);
        }

        // create a model matrix for the drop.
        var model = mat4.create();
        // translate to the drop's position.
        mat4.translate(model, model, [drop.x, drop.y, 0]);

        // rotate the drop.
        //angle = getDelta(0, 180) * (Math.PI / 180);
        //mat4.rotateZ(model, model, angle);

        //scale_vector = [getDelta(3, 7), getDelta(3, 7), 0];
        //mat4.scale(model, model, scale_vector);
        //console.log(model);

        // send the model matrix to the shader to be drawn.
        gl.uniformMatrix4fv(matrixUniformLocation, false, model);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); // Draw square (2 triangles)
    }
    // request the next frame.
    setTimeout(() => {render();}, 5);
}

document.getElementById("renderBtn").addEventListener("click", render);