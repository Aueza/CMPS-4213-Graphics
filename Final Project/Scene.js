// Solar system with basic Lambertian lighting and a starfield.

// Vertex shader for planets.
const sceneVert = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vPosition = worldPos.xyz;
    vNormal = mat3(uModel) * aNormal;
    gl_Position = uProjection * uView * worldPos;
}`;

// Vertex shader for stars
const starVert = `
attribute vec3 aPosition;
uniform mat4 uView;
uniform mat4 uProjection;
void main() {
    gl_PointSize = 2.0;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}`;

// Fragment shader for planets (Lambertian shading) using sun as light source.
const sceneFrag = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uLightPos;
uniform vec3 uBaseColor;
void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vPosition - uLightPos);
    float diff = max(dot(N, L), 0.0);
    vec3 color = uBaseColor * (0.18 + 0.82 * diff); // 0.18 ambient, 0.82 diffuse
    gl_FragColor = vec4(color, 1.0);
}`;

// Fragment shader for stars
const starFrag = `
precision mediump float;
void main(){
    gl_FragColor = vec4(1.0);
}`;

// Utility: compile shader/program
function compileShader(gl, src, type) {
    // Compile shader
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    
    return s;
}
function createProgram(gl, vsSrc, fsSrc) {
    // Compile shaders
    const vs = compileShader(gl, vsSrc, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fsSrc, gl.FRAGMENT_SHADER);
    const p = gl.createProgram();
    // Attach and link
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}

// Compute per-vertex normals (average of adjacent face normals)
function computeVertexNormals(vertices, faces) {
    // Initialize normals array with zeros
    const nVerts = vertices.length;
    const normals = new Array(nVerts).fill(0).map(() => [0, 0, 0]);
    for (const f of faces) {
        // Calculate face normal
        const a = vertices[f[0]];
        const b = vertices[f[1]];
        const c = vertices[f[2]];
        // Cross product
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
        const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        // Normal
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        // Add to each vertex normal
        for (const idx of f) {
            normals[idx][0] += nx;
            normals[idx][1] += ny;
            normals[idx][2] += nz;
        }
    }
    // Normalize
    return normals.map(n => {
        const l = Math.hypot(n[0], n[1], n[2]) || 1.0;
        return [n[0] / l, n[1] / l, n[2] / l];
    });
}

// Build buffers for a solid-colored, smooth-shaded sphere
function buildSphereBuffers(gl, blueprint, color) {
    const verts = blueprint.geometry;
    const faces = blueprint.topology;
    const normals = computeVertexNormals(verts, faces);

    // Expand to flat arrays
    const posArr = [];
    const normArr = [];
    // For each face, add its vertices and normals
    for (const face of faces) {
        for (const vi of face) {
            const v = verts[vi];
            const n = normals[vi];
            posArr.push(v[0], v[1], v[2]);
            normArr.push(n[0], n[1], n[2]);
        }
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posArr), gl.STATIC_DRAW);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normArr), gl.STATIC_DRAW);

    return { posBuf, normBuf, vertexCount: posArr.length / 3, color };
}

// Building star positions.
function buildStarBuffer(gl, numStars = 200, radius = 80){
    const positions = [];
    for(let i = 0; i < numStars; ++i){
        // Random points on sphere
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions.push(x, y, z);
    }
    // Create and bind star buffer
    const starBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return {starBuf, count: numStars};
}

// Start the solar system scene
function startPlanetScene() {
    const canvas = document.getElementById('glCanvas');
    if (!canvas) { console.error('No canvas with id glCanvas found'); return; }
    const gl = canvas.getContext('webgl');
    if (!gl) { console.error('WebGL not supported'); return; }

    // Set viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.02, 0.05, 1.0);

    // Create shader program for planet and stars
    const planetProgram = createProgram(gl, sceneVert, sceneFrag);
    const starProgram = createProgram(gl, starVert, starFrag);

    // Planet uniform/ attribute locations
    const aPos = gl.getAttribLocation(planetProgram, 'aPosition');
    const aNorm = gl.getAttribLocation(planetProgram, 'aNormal');
    const uModel = gl.getUniformLocation(planetProgram, 'uModel');
    const uView = gl.getUniformLocation(planetProgram, 'uView');
    const uProj = gl.getUniformLocation(planetProgram, 'uProjection');
    const uLightPos = gl.getUniformLocation(planetProgram, 'uLightPos');
    const uBaseColor = gl.getUniformLocation(planetProgram, 'uBaseColor');

    // Star uniform/ attribute locations
    const sPos = gl.getAttribLocation(starProgram, 'aPosition');
    const sView = gl.getUniformLocation(starProgram, 'uView');
    const sProj = gl.getUniformLocation(starProgram, 'uProjection');

    // Camera setup
    let camYam = 0; // left-right
    let camPitch = 0; // up-down
    let camDist = 30; // distance from origin

    // keyboard controls for camera
    window.addEventListener('keydown', function(e) {
        const step = 0.05;
        if (e.key === 'ArrowLeft') camYam -= step;
        if (e.key === 'ArrowRight') camYam += step;
        if (e.key === 'ArrowUp') camPitch = Math.min(Math.PI/2, camPitch + step);
        if (e.key === 'ArrowDown') camPitch = Math.max(-Math.PI/2, camPitch - step);
        if (e.key === '+' || e.key === '=') camDist = Math.max(5, camDist - 1);
        if (e.key === '-' || e.key === '_') camDist = Math.min(100, camDist + 1);
    });

    // Compute view and projection matrices for camera
    const viewMatrix = mat4.create();
    const projMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 6, 30], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 200);

    // Planets: [name, distance, radius, color]
    const planets = [
        ['Sun', 0.0, 4.0, [6.5, 5.2, 2.0]],
        ['Mercury', 6.0, 0.4, [0.6, 0.6, 0.6]],
        ['Venus', 9.0, 0.95, [0.9, 0.7, 0.3]],
        ['Earth', 13.0, 1.0, [0.2, 0.5, 0.9]],
        ['Mars', 16.5, 0.53, [0.9, 0.3, 0.2]],
        ['Jupiter', 21.5, 2.2, [0.9, 0.6, 0.3]],
        ['Saturn', 27.0, 1.8, [0.95, 0.85, 0.6]],
        ['Uranus', 32.0, 1.0, [0.6, 0.9, 0.95]],
        ['Neptune', 36.0, 1.0, [0.25, 0.45, 0.9]]
    ];

    // Use higher subdivision for smoother spheres
    const bp = window.blueprints && window.blueprints.uvSphere ? window.blueprints.uvSphere(48, 36) : null;
    if (!bp) { console.error('Sphere blueprint not available'); return; }

    // Build planet objects
    const objects = [];
    for (const p of planets) {
        const name = p[0], distance = p[1], radius = p[2], color = p[3];
        const bufs = buildSphereBuffers(gl, bp, color);
        objects.push({ name, distance, radius, bufs });
    }

    // Build star buffer
    const stars = buildStarBuffer(gl, 500, 80);

    let t = 0;
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        
        // Calculate camera position from yam, pitch, and dist
        const camX = camDist * Math.cos(camPitch) * Math.sin(camYam);
        const camY = camDist * Math.sin(camPitch);
        const camZ = camDist * Math.cos(camPitch) * Math.cos(camYam);

        mat4.lookAt(viewMatrix, [camX, camY, camZ], [0, 0, 0], [0, 1, 0]);

        // Draw stars
        gl.useProgram(starProgram);
        gl.uniformMatrix4fv(sView, false, viewMatrix);
        gl.uniformMatrix4fv(sProj, false, projMatrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, stars.starBuf);
        gl.enableVertexAttribArray(sPos);
        gl.vertexAttribPointer(sPos, 3, gl.FLOAT, false, 0, 0);
        gl.disable(gl.DEPTH_TEST); // drawing behind everything.
        gl.drawArrays(gl.POINTS, 0, stars.count);
        gl.enable(gl.DEPTH_TEST);

        // Draw planets
        gl.useProgram(planetProgram);
        gl.uniformMatrix4fv(uView, false, viewMatrix);
        gl.uniformMatrix4fv(uProj, false, projMatrix);
        gl.uniform3fv(uLightPos, [0,0,0]); // Sun at origin

        t += 0.01;

        for (const obj of objects) {
            // Animate planets (except sun)
            let angle = 0;
            if (obj.distance > 0.0) {
                angle = t * (0.2 + 0.05 * (1.0 / Math.max(0.1, obj.radius)));
            }
            // Model matrix
            const m = mat4.create();
            const x = obj.distance * Math.cos(angle);
            const z = obj.distance * Math.sin(angle);
            
            mat4.translate(m, m, [x, 0, z]);
            mat4.scale(m, m, [obj.radius, obj.radius, obj.radius]);
        
            gl.uniformMatrix4fv(uModel, false, m);
            gl.uniform3fv(uBaseColor, obj.bufs.color);

            // Bind buffers and draw
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.posBuf);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPos);

            // Normals
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufs.normBuf);
            gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aNorm);

            gl.drawArrays(gl.TRIANGLES, 0, obj.bufs.vertexCount);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
// Expose planet starter
window.startPlanetScene = startPlanetScene;