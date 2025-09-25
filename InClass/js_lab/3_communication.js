var zeldGeoBuffer = gl.createBuffer();
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(zeldGeoBuffer), gl.STATIC_DRAW);

// associating the data to vertix shader; aPosition attribute

var positionLoc = gl.getAttribLocation( program, "aPosition");
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);



// // creating buffer for the square

// var vBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareOfTriangles), gl.STATIC_DRAW);

// // associating the data to vertix shader; aPosition attribute

// var positionLoc = gl.getAttribLocation( program, "aPosition");
// gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(positionLoc);



// var cBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// var colorLoc = gl.getAttribLocation( program, "aColor");
// gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(colorLoc);


function render() {
    // clear
    // drawyArrays
}