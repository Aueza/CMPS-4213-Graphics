let vtShader = 

`
attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
void main() {

    gl_Position.x = aPosition.x ;
    gl_Position.y = aPosition.y ;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;


    vColor = aColor;
}
`;

let fgShader = 
`precision mediump float;
varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;



vertShdr = gl.createShader( gl.VERTEX_SHADER );
gl.shaderSource( vertShdr, vertShaderSrcCode);
gl.compileShader( vertShdr );
console.log(gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS));
console.log(gl.getShaderInfoLog( vertShdr ));

fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
gl.shaderSource( fragShdr, fragShaderSrcCode);
gl.compileShader( fragShdr );
console.log(gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS));
console.log(gl.getShaderInfoLog( fragShdr ));

var program = gl.createProgram();
gl.attachShader( program, vertShdr );
gl.attachShader( program, fragShdr );
gl.linkProgram( program );
console.log(gl.getProgramInfoLog( program ));
gl.useProgram(program)




const redPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, redPositionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, redPositions, gl.STATIC_DRAW);

const redColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, redColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, redColors, gl.STATIC_DRAW);


