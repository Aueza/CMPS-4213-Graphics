// single rotating colored cube.

const sceneVert = `
attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
void main(){
  vColor = aColor;
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}`;

const sceneFrag = `
precision mediump float;
varying vec3 vColor;
void main(){
  gl_FragColor = vec4(vColor, 1.0);
}`;

function createShader(gl, type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

function createProgram(gl, vsSrc, fsSrc){
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(p));
  }
  return p;
}

function startBasicScene(){
  const canvas = document.getElementById('glCanvas');
  if(!canvas){ console.error('Missing canvas #glCanvas'); return; }
  const gl = canvas.getContext('webgl');
  if(!gl){ console.error('WebGL not supported'); return; }

  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0.12,0.16,0.22,1.0);
  gl.enable(gl.DEPTH_TEST);

  const program = createProgram(gl, sceneVert, sceneFrag);
  gl.useProgram(program);

  const aPos = gl.getAttribLocation(program,'aPosition');
  const aCol = gl.getAttribLocation(program,'aColor');
  const uModel = gl.getUniformLocation(program,'uModel');
  const uView  = gl.getUniformLocation(program,'uView');
  const uProj  = gl.getUniformLocation(program,'uProjection');

  // Cube (12 triangles). Each face solid color.
  const cubeVerts = [
    // +X (red)
    1,-1,-1,  1,1,-1,  1,1,1,
    1,-1,-1,  1,1,1,   1,-1,1,
    // -X (green)
    -1,-1,-1, -1,1,1, -1,1,-1,
    -1,-1,-1, -1,-1,1, -1,1,1,
    // +Y (blue)
    -1,1,-1,  1,1,-1,  1,1,1,
    -1,1,-1,  1,1,1,  -1,1,1,
    // -Y (yellow)
    -1,-1,-1,  1,-1,1,  1,-1,-1,
    -1,-1,-1, -1,-1,1,  1,-1,1,
    // +Z (magenta)
    -1,-1,1,  1,1,1,   1,-1,1,
    -1,-1,1, -1,1,1,   1,1,1,
    // -Z (cyan)
    -1,-1,-1, 1,-1,-1, 1,1,-1,
    -1,-1,-1, 1,1,-1, -1,1,-1
  ];
  const faceColors = [
    [1,0.2,0.2],[1,0.2,0.2],
    [0.2,1,0.2],[0.2,1,0.2],
    [0.2,0.4,1],[0.2,0.4,1],
    [1,1,0.3],[1,1,0.3],
    [1,0.3,1],[1,0.3,1],
    [0.2,1,1],[0.2,1,1]
  ];
  const colors = [];
  for(const c of faceColors){
    for(let i=0;i<6;i++) colors.push(c[0],c[1],c[2]);
  }

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cubeVerts),gl.STATIC_DRAW);

  const colBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,colBuf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);

  const view = mat4.create();
  mat4.lookAt(view,[0,0,6],[0,0,0],[0,1,0]);
  const proj = mat4.create();
  mat4.perspective(proj,45*Math.PI/180, canvas.width/canvas.height, 0.1, 100);

  let angle = 0;
  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    angle += 0.01;
    const model = mat4.create();
    mat4.rotateY(model,model,angle);
    mat4.rotateX(model,model,angle*0.6);

    gl.useProgram(program);
    gl.uniformMatrix4fv(uModel,false,model);
    gl.uniformMatrix4fv(uView,false,view);
    gl.uniformMatrix4fv(uProj,false,proj);

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);
    gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER,colBuf);
    gl.vertexAttribPointer(aCol,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(aCol);

    gl.drawArrays(gl.TRIANGLES,0,cubeVerts.length/3);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

window.startBasicScene = startBasicScene;