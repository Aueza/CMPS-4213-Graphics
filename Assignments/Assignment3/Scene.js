// Simple 3D scene using blueprints from main.js
// Expects a canvas with id 'glCanvas' and the blueprint functions to be
// available on window.blueprints (main.js exposes them when loaded).

// Vertex shader (pos + color)
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

// Utility: create shader and program
function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
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
        console.error('Program link error:', gl.getProgramInfoLog(p));
    }
    return p;
}

// HSV -> RGB helper
function hsvToRgb(h, s, v){
    let r=0,g=0,b=0;
    const i = Math.floor(h*6);
    const f = h*6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f*s);
    const t = v * (1 - (1 - f) * s);
    switch(i % 6){
        case 0: r=v; g=t; b=p; break;
        case 1: r=q; g=v; b=p; break;
        case 2: r=p; g=v; b=t; break;
        case 3: r=p; g=q; b=v; break;
        case 4: r=t; g=p; b=v; break;
        case 5: r=v; g=p; b=q; break;
    }
    return [r,g,b];
}

// Build buffers from blueprint (geometry/topology). This does its own
// adjacency-based greedy coloring (so neighboring faces differ).
function buildBuffersFromBlueprint(gl, blueprint){
    const verts = blueprint.geometry;
    const faces = blueprint.topology;

    // build edge map
    const edgeMap = new Map();
    faces.forEach((face, fi) =>{
        for(let e=0;e<3;e++){
            const a = Math.min(face[e], face[(e+1)%3]);
            const b = Math.max(face[e], face[(e+1)%3]);
            const key = `${a}-${b}`;
            if(!edgeMap.has(key)) edgeMap.set(key, []);
            edgeMap.get(key).push(fi);
        }
    });

    const nFaces = faces.length;
    const adj = new Array(nFaces).fill(0).map(()=> new Set());
    for(const arr of edgeMap.values()){
        if(arr.length > 1){
            for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++){
                adj[arr[i]].add(arr[j]); adj[arr[j]].add(arr[i]);
            }
        }
    }

    // greedy coloring
    const faceColorIdx = new Array(nFaces).fill(-1);
    for(let fi=0; fi<nFaces; fi++){
        const used = {};
        adj[fi].forEach(nb => { const idx = faceColorIdx[nb]; if(idx !== -1) used[idx]=true; });
        let c=0; while(used[c]) c++; faceColorIdx[fi]=c;
    }
    const nColorsUsed = Math.max(...faceColorIdx) + 1;

    const positionArray = [];
    const colorArray = [];
    faces.forEach((face, fi) =>{
        const color = hsvToRgb(faceColorIdx[fi] / Math.max(1,nColorsUsed), 0.65, 0.95);
        face.forEach(vi => {
            const v = verts[vi];
            positionArray.push(v[0], v[1], v[2]);
            colorArray.push(color[0], color[1], color[2]);
        });
    });

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArray), gl.STATIC_DRAW);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);

    return { vertexBuffer: posBuf, colorBuffer: colBuf, vertexCount: positionArray.length/3 };
}

function start3DScene(){
    const canvas = document.getElementById('glCanvas');
    if(!canvas){ console.error('No canvas with id glCanvas found'); return; }
    const gl = canvas.getContext('webgl');
    if(!gl){ console.error('WebGL not supported'); return; }

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.95, 1.0);

    const program = createProgram(gl, sceneVert, sceneFrag);
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'aPosition');
    const aCol = gl.getAttribLocation(program, 'aColor');
    const uModel = gl.getUniformLocation(program, 'uModel');
    const uView = gl.getUniformLocation(program, 'uView');
    const uProj = gl.getUniformLocation(program, 'uProjection');

    // camera
    const viewMatrix = mat4.create();
    const projMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0,2,8], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, 45 * Math.PI/180, canvas.width / canvas.height, 0.1, 100);

    // prepare scene objects from available blueprints
    const bp = window.blueprints || {};
    const names = ['cube','tetra','icosa','dodeca','sphere'];
    const objects = [];
    let x = -4.0;
    for(const name of names){
        if(typeof bp[name] !== 'function') { x += 2.0; continue; }
        const blueprint = (name === 'sphere') ? bp[name](2) : bp[name]();
        const bufs = buildBuffersFromBlueprint(gl, blueprint);

        // model matrix: position them along x axis
        const model = mat4.create();
        mat4.translate(model, model, [x, 0.0, 0.0]);
        mat4.scale(model, model, [0.9,0.9,0.9]);

        objects.push({ name, blueprint, bufs, model });
        x += 2.0;
    }

    let angle = 0;
    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        // ensure program is active before setting uniforms
        gl.useProgram(program);

        // rotate whole scene slowly
        angle += 0.005;
        const view = mat4.clone(viewMatrix);
        mat4.rotateY(view, view, angle*0.2);

        gl.uniformMatrix4fv(uView, false, view);
        gl.uniformMatrix4fv(uProj, false, projMatrix);

        for(const obj of objects){
            // rotate each object as well
            const m = mat4.clone(obj.model);
            mat4.rotateY(m, m, angle);
            mat4.rotateX(m, m, angle*0.3);
            gl.uniformMatrix4fv(uModel, false, m);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.vertexBuffer);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPos);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.colorBuffer);
            gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aCol);

            gl.drawArrays(gl.TRIANGLES, 0, obj.bufs.vertexCount);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// expose starter and do NOT auto-start; caller (UI button) should invoke
window.start3DScene = start3DScene;

// Build buffers for a solid-colored triangulated blueprint (uniform color)
function buildSolidColorFromBlueprint(gl, blueprint, color){
    const verts = blueprint.geometry;
    const faces = blueprint.topology;
    const positionArray = [];
    const colorArray = [];
    for(const face of faces){
        for(const vi of face){
            const v = verts[vi];
            positionArray.push(v[0], v[1], v[2]);
            colorArray.push(color[0], color[1], color[2]);
        }
    }
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArray), gl.STATIC_DRAW);
    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
    return { vertexBuffer: posBuf, colorBuffer: colBuf, vertexCount: positionArray.length/3 };
}

// Start a simple solar system / planet scene
function startPlanetScene(){
    const canvas = document.getElementById('glCanvas');
    if(!canvas){ console.error('No canvas with id glCanvas found'); return; }
    const gl = canvas.getContext('webgl');
    if(!gl){ console.error('WebGL not supported'); return; }

    gl.viewport(0,0,canvas.width, canvas.height);
    // dark background for space
    gl.clearColor(0.02, 0.02, 0.05, 1.0);

    const program = createProgram(gl, sceneVert, sceneFrag);
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'aPosition');
    const aCol = gl.getAttribLocation(program, 'aColor');
    const uModel = gl.getUniformLocation(program, 'uModel');
    const uView = gl.getUniformLocation(program, 'uView');
    const uProj = gl.getUniformLocation(program, 'uProjection');

    const viewMatrix = mat4.create();
    const projMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0,6,30], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, 45 * Math.PI/180, canvas.width / canvas.height, 0.1, 200);

    const bp = window.blueprints || {};
    if(typeof bp['sphere'] !== 'function'){
        console.error('sphere blueprint not available');
        return;
    }

    // Planet definitions: [name, distance, radius, colorRGB]
    const planets = [
        ['Sun', 0.0, 4.0, [1.0, 0.9, 0.2]],
        ['Mercury', 6.0, 0.4, [0.6,0.6,0.6]],
        ['Venus', 9.0, 0.95, [0.9,0.7,0.3]],
        ['Earth', 13.0, 1.0, [0.2,0.5,0.9]],
        ['Mars', 16.5, 0.53, [0.9,0.3,0.2]],
        ['Jupiter', 21.5, 2.2, [0.9,0.6,0.3]],
        ['Saturn', 27.0, 1.8, [0.95,0.85,0.6]],
        ['Uranus', 32.0, 1.0, [0.6,0.9,0.95]],
        ['Neptune', 36.0, 1.0, [0.25,0.45,0.9]]
    ];

    const objects = [];
    for(const p of planets){
        const name = p[0];
        const distance = p[1];
        const radius = p[2];
        const color = p[3];
        // higher subdivision for smoother spheres
        const blueprint = bp['sphere'](3);
        const bufs = buildSolidColorFromBlueprint(gl, blueprint, color);

        const model = mat4.create();
        // initially place along +X axis
        mat4.translate(model, model, [distance, 0, 0]);
        mat4.scale(model, model, [radius, radius, radius]);
        objects.push({ name, distance, radius, bufs, model });
    }

    let t = 0;
    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        // ensure program is active before setting uniforms
        gl.useProgram(program);

        t += 0.01;
        gl.uniformMatrix4fv(uView, false, viewMatrix);
        gl.uniformMatrix4fv(uProj, false, projMatrix);

        // draw orbits (approx as thin rings by drawing small points is expensive; skip for now)

        for(const obj of objects){
            const angle = t * (0.2 + 0.05 * (1.0/Math.max(0.1, obj.radius)) );
            // compute orbital transform
            const m = mat4.create();
            const x = obj.distance * Math.cos(angle);
            const z = obj.distance * Math.sin(angle);
            mat4.translate(m, m, [x, 0, z]);
            mat4.scale(m, m, [obj.radius, obj.radius, obj.radius]);

            gl.uniformMatrix4fv(uModel, false, m);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.vertexBuffer);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPos);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.colorBuffer);
            gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aCol);

            gl.drawArrays(gl.TRIANGLES, 0, obj.bufs.vertexCount);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// expose planet starter
window.startPlanetScene = startPlanetScene;