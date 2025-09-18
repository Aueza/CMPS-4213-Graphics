var JSxShift = 0.0;
var JSyShift = 0.0;
var vertShaderSrcCode = 
`
uniform float shaderShiftX;
uniform float shaderShiftY;
attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;

void main() {

    gl_Position.x = aPosition.x  + shaderShiftX;
    gl_Position.y = aPosition.y + shaderShiftY;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;


    vColor = aColor;
}
`;

var fragShaderSrcCode = 

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

var connShiftX = gl.getUniformLocation(program, "shaderShiftX");
var connShiftY = gl.getUniformLocation(program, "shaderShiftY");


function moveDown(event) {
    JSyShift -= 0.01;
    console.log("move down "+ JSyShift);
    gl.uniform1f(connShiftY, JSyShift);

    render()
}
function moveUp(event) {
    JSyShift += 0.01;
    console.log("move up " + JSyShift);
    gl.uniform1f(connShiftY, JSyShift);

    render()
}
function moveLeft(event) {
    JSxShift -= 0.01;
    console.log("move left");
    gl.uniform1f(connShiftX, JSxShift);
    
    render()
}
function moveRight(event) {
    JSxShift += 0.01;
    console.log("move right " + JSxShift);
    gl.uniform1f(connShiftX, JSxShift);

    render()
}

function render(event) {
    gl.clear( gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.drawArrays( gl.TRIANGLES, 0, 6);
}


btnRender = document.getElementById("btnRender");
btnRender.addEventListener("click", render);

btLeft = document.getElementById("btnLeft");
btnLeft.addEventListener("click", moveLeft);

btnRight = document.getElementById("btnRight");
btnRight.addEventListener("click", moveRight);


btnUp = document.getElementById("btnUp");
btnUp.addEventListener("click", moveUp);

btnMDown = document.getElementById("btnDown");
btnMDown.addEventListener("click", moveDown);

