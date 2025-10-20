// Helper function to create buffers for Float data type.
function createBindDataBufferFloat(data){
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    return buffer;
}

// Helper function to create buffers for Int data type.
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

// Helper function to compile, link, and use shader programs.
function createShaderProgram(vertShaderCode, fragShaderCode){
    // Initializing vertex and fragment shaders.
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

// Helper function to draw a rectangle.
function drawRect(x, y, w, h, color) {
    var vertices = [
        x, y, 0.0,
        x, y + h, 0.0,
        x + w, y + h, 0.0,
        x + w, y, 0.0
        ];

    var indices = [0, 1, 2, 0, 2, 3];

    // Vertex buffer
    var vertex_buffer = createBindDataBufferFloat(vertices);

    // Index buffer
    var index_buffer = createBindDataBufferInt(indices);

    // Vertex shader
    var vertCode =
        'attribute vec3 coordinates;' +
        'void main(void){' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        '}';

    // Fragment shader
    var fragCode =
        'void main(void) {' +
        ' gl_FragColor = vec4(' + color.join(',') + ');' +
        '}';

    // Shader program
    var shaderProgram = createShaderProgram(vertCode, fragCode);

    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // Draw the rectangle
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Helper to draw bricks.
function drawBricks(x, y, width, height, gap, rows, cols, color){
    var startX = x;
    var startY = y;
    var brickWidth = width;
    var brickHeight = height;
    var brickGap = 0.005;
    var brickCols = cols;
    var brickRows = rows;

    var vertices = [];
    var indices = [];
    var brickColor = color;

    var vertCount = 0;
    for (var row = 0; row < brickRows; row++) {
        for (var col = 0; col < brickCols; col++) {
            var x = startX + col * (brickWidth + brickGap);
            var y = startY + row * (brickHeight + brickGap);

            var v0 = [x, y, 0.0];
            var v1 = [x, y + brickHeight, 0.0];
            var v2 = [x + brickWidth, y + brickHeight, 0.0];
            var v3 = [x + brickWidth, y, 0.0];

            vertices.push(...v0, ...v1, ...v2, ...v3);

            indices.push(
            vertCount, vertCount + 1, vertCount + 2,
            vertCount, vertCount + 2, vertCount + 3
            );
            vertCount += 4;
        }
    }

    // Vertex buffer.
    var vertex_buffer = createBindDataBufferFloat(vertices);

    // Index buffer.
    var Index_Buffer = createBindDataBufferInt(indices);

    // Vertex shader.
    var vertCode =
        'attribute vec3 coordinates;' +
        'void main(void){' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        '}';

    // Fragment shader.
    var fragCode =
        'void main(void) {' +
        ' gl_FragColor = vec4(' + brickColor + ');' +
        '}';

    // Shader program.
    var shaderProgram = createShaderProgram(vertCode, fragCode);

    // Bind vertex & index buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

    // Get attribute location.
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // Draw the bricks.
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Helper function to draw a triangle.
function drawTriangle(v1, v2, v3, color){
    var vertices = [
        v1[0], v1[1], v1[2],
        v2[0], v2[1], v2[2],
        v3[0], v3[1], v3[2]
    ];

    var indices = [0, 1, 2];

    // Vertex buffer.
    var Vertex_buffer = createBindDataBufferFloat(vertices);

    // Index buffer.
    var Index_buffer = createBindDataBufferInt(indices);

    // Vertex shader.
    var vertCode = 
        'attribute vec3 coordinates;' +
        'void main(void){' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        '}';
    
    // Fragment shader.
    var fragCode = 
        'void main(void) {' +
        'gl_FragColor = vec4(' + color + ');' +
        '}';
    
    // Shader program.
    var shaderProgram = createShaderProgram(vertCode, fragCode);

    // Bind vertex & index buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, Vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_buffer)

    // Get attribute location.
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // Draw the triangle.
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawScene(){
    // Clear the canvas to stormy grey.
    gl.clearColor(0.35, 0.37, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // ================= BUILDING ==================
    // Draw building background (grey rectangle)
    // (x, y, width, height, color)
    drawRect(-0.80, -0.58, 1.61, 0.70, [0.2, 0.2, 0.2, 1.0]);

    // Draw bricks.
    // (x, y, width, height, gap, rows, cols, color)
    drawBricks(-0.80, -0.58, 0.08, 0.042, 0.005, 15, 19, [0.55, 0.15, 0.08, 1.0]);

    // Draw building roof (brown triangle)
    drawTriangle(
        [-0.80, 0.12, 0.0],
        [0.81, 0.12, 0.0],
        [0.005, 0.60, 0.0],
        [0.5, 0.25, 0.1, 1.0]);


    // ================= DOOR ==================
    // Draw a door frame (white rectangle)
    drawRect(0.21, -0.56, 0.27, 0.42, [1.0, 1.0, 1.0, 1.0]);

    // Draw a door
    drawRect(0.22, -0.55, 0.25, 0.40, [0.3, 0.2, 0.1, 1.0]);

    // Draw door knob (small black rectangle)
    drawRect(0.40, -0.35, 0.02, 0.02, [0.0, 0.0, 0.0, 1.0]);


    // ================= WINDOWS ==================
    // Draw window frames (white rectangles)
    drawRect(-0.16, -0.36, 0.27, 0.27, [1.0, 1.0, 1.0, 1.0]);
    drawRect(-0.61, -0.36, 0.27, 0.27, [1.0, 1.0, 1.0, 1.0]);

    // Draw windows (warm yellow glow - cozy light from inside)
    drawRect(-0.15, -0.35, 0.25, 0.25, [1.0, 0.9, 0.5, 1.0]);
    drawRect(-0.60, -0.35, 0.25, 0.25, [1.0, 0.9, 0.5, 1.0]);

    // Draw window panes (black lines)
    drawRect(-0.025, -0.36, 0.01, 0.27, [0.0, 0.0, 0.0, 1.0]);
    drawRect(-0.16, -0.23, 0.27, 0.01, [0.0, 0.0, 0.0, 1.0]);
    drawRect(-0.475, -0.36, 0.01, 0.27, [0.0, 0.0, 0.0, 1.0]);
    drawRect(-0.61, -0.23, 0.27, 0.01, [0.0, 0.0, 0.0, 1.0]);


    // ================= ROAD ==================
    // Draw road (dark rectangle at bottom)
    drawRect(-1.00, -1.00, 2.00, 0.42, [0.15, 0.15, 0.15, 1.0]);
    // Draw road divider (yellow thin line)
    drawRect(-1.00, -0.82, 2.00, 0.10, [1.0, 1.0, 0.0, 1.0]);


    // ================= SUN & CLOUDS ==================
    // Sun (yellow rectangle)
    //drawRect(0.65, 0.65, 0.25, 0.25, [1.0, 1.0, 0.0, 1.0]);

    // Clouds (dark gray rectangles)
    drawRect(-0.90, 0.75, 0.30, 0.12, [0.6, 0.6, 0.65, 1.0]);
    drawRect(-0.70, 0.70, 0.25, 0.10, [0.65, 0.65, 0.7, 1.0]);
    drawRect(-0.55, 0.78, 0.28, 0.11, [0.55, 0.55, 0.6, 1.0]);
    drawRect(-0.30, 0.72, 0.22, 0.09, [0.6, 0.6, 0.65, 1.0]);
    drawRect(0.00, 0.76, 0.32, 0.13, [0.58, 0.58, 0.63, 1.0]);
    drawRect(0.40, 0.70, 0.26, 0.10, [0.62, 0.62, 0.67, 1.0]);
    drawRect(0.70, 0.74, 0.25, 0.11, [0.6, 0.6, 0.65, 1.0]);
}

//========================================================================

//                          Main rendering code     

//========================================================================
drawScene();