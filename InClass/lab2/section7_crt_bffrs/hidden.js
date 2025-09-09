// var squareOfTriangles = [
//     -0.5,  0.5,  0.0, 
//      0.5,  0.5,  0.0, 
//      0.5, -0.5,  0.0, 

//     -0.5,  0.5,  0.0,
//      0.5, -0.5,  0.0,
//     -0.5, -0.5,  0.0 
// ];

// console.log(squareOfTriangles);
// var vertShaderSrcCode = 
// `
// attribute vec3 aPosition;
// void main() {
//     gl_Position = vec4(aPosition, 1.0);
// }
// `;


// var fragShaderSrcCode = 
// `void main() {
//     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
// }
// `;

// vertShdr = gl.createShader( gl.VERTEX_SHADER );
// gl.shaderSource( vertShdr, vertShaderSrcCode);
// gl.compileShader( vertShdr );
// console.log(gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS));
// console.log(gl.getShaderInfoLog( vertShdr ));

// fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
// gl.shaderSource( fragShdr, fragShaderSrcCode);
// gl.compileShader( fragShdr );
// console.log(gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS));
// console.log(gl.getShaderInfoLog( fragShdr ));

// var program = gl.createProgram();
// gl.attachShader( program, vertShdr );
// gl.attachShader( program, fragShdr );
// gl.linkProgram( program );
// console.log(gl.getProgramInfoLog( program ));
// gl.useProgram(program)



// creating buffer for the square

// var vBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareOfTriangles), gl.STATIC_DRAW);

// associating the data to vertix shader; aPosition attribute

var positionLoc = gl.getAttribLocation( program, "aPosition");
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);


gl.clearColor(1.0, 1.0, 1.0, 1.0);

gl.clear( gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);

gl.drawArrays( gl.TRIANGLES, 0, 6);


