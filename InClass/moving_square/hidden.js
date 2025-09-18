var squareOfTriangles = [
    -0.5,  0.5,  0.0, 
     0.5,  0.5,  0.0, 
     0.5, -0.5,  0.0, 

    -0.5,  0.5,  0.0,
     0.5, -0.5,  0.0,
    -0.5, -0.5,  0.0 
];


var colors = [
    1.0, 0.0, 0.0, 
    1.0, 0.0, 0.0, 
    1.0, 0.0, 0.0,

    0.0, 0.0, 1.0, 
    0.0, 0.0, 1.0, 
    0.0, 0.0, 1.0,
]






// creating buffer for the square

var vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareOfTriangles), gl.STATIC_DRAW);

// associating the data to vertix shader; aPosition attribute

var positionLoc = gl.getAttribLocation( program, "aPosition");
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);



var cBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

var colorLoc = gl.getAttribLocation( program, "aColor");
gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorLoc);

// var thetaLoc = gl.getUniformLocation( program, "uTheta" );
// console.log(thetaLoc);


gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.enable(gl.DEPTH_TEST);
// gl.clear( gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
// gl.drawArrays( gl.TRIANGLES, 0, 6);


