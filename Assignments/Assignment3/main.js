// Vertex shader
const vertShaderSrc = 
`attribute vec3 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main(){
    vColor = aColor;
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}`;

// Fragment shader
const fragShaderSrc = 
`precision mediump float;
varying vec3 vColor;

void main(){
    gl_FragColor = vec4(vColor, 1.0);
}`;

window.onload = function main(){
    // Blueprint functions
    function drawCube(){
        // Geometry list
        let cubeVertices = [
            [-1, -1, 1],
            [1, -1, 1],
            [1, 1, 1],
            [-1, 1, 1],
            [-1, -1, -1],
            [1, -1, -1],
            [1, 1, -1],
            [-1, 1, -1]
        ];

        // Topology list (triangulated faces)
        let cubeFaces = [
            [0, 1, 2],
            [0, 2, 3],

            [4, 5, 6],
            [4, 6, 7],

            [3, 2, 6],
            [3, 6, 7],

            [0, 1, 5],
            [0, 5, 4],

            [0, 4, 7],
            [0, 7, 3],

            [1, 5, 6],
            [1, 6, 2]
        ];

        return {
            geometry: cubeVertices,
            topology: cubeFaces
        };
    }

    function drawTetrahedron(){
        // Geometry list
        let tetraVertices = [
            [ 1,  1,  1], // idx 0
            [-1, -1,  1], // idx 1
            [-1,  1, -1], // idx 2
            [ 1, -1, -1]  // idx 3
        ];

        // Topology list
        let tetraFaces = [
            [0, 1, 2], // Face 1
            [0, 2, 3], // Face 2
            [0, 3, 1], // Face 3
            [1, 3, 2]  // Face 4
        ];

        return {
            geometry: tetraVertices,
            topology: tetraFaces
        };
    }

    function drawOctahedron(){
        // Geometry list
        let octaVertices = [
            [ 0,  1,  0], // idx 0
            [ 0, -1,  0], //idx 1
            [ 1,  0,  0], //idx 2
            [-1,  0,  0], //idx 3
            [ 0,  0,  1], //idx 4
            [ 0,  0, -1]  //idx 5
        ];

        // Topology list
        let octaFaces = [
            [0, 2, 4],
            [0, 4, 3],
            [0, 3, 5],
            [0, 5, 2],

            [1, 4, 2],
            [1, 3, 4],
            [1, 5, 3],
            [1, 2, 5]
        ];

        return {
            geometry: octaVertices,
            topology: octaFaces
        };
    }

    function drawDodecahedron(){
        // Build dodecahedron as the dual of an icosahedron.
        // We compute centroids of the 20 icosahedron faces to be the dodecahedron vertices.
        const icosa = drawIcosahedron();
        const V = icosa.geometry;
        const F = icosa.topology;

        // helper: compute centroid of a face
        function faceCentroid(face){
            const a = V[face[0]], b = V[face[1]], c = V[face[2]];
            return [ (a[0]+b[0]+c[0])/3, (a[1]+b[1]+c[1])/3, (a[2]+b[2]+c[2])/3 ];
        }

        // compute dodecahedron vertices as normalized centroids
        const dodecaVertices = F.map(face => {
            const c = faceCentroid(face);
            const len = Math.hypot(c[0], c[1], c[2]);
            return [c[0]/len, c[1]/len, c[2]/len];
        });

        // For each original icosa vertex, gather adjacent face indices -> those form one pentagon in the dodecahedron
        const facesAroundVertex = new Array(V.length).fill(0).map(()=>[]);
        for(let fi=0; fi<F.length; fi++){
            const face = F[fi];
            for(const vi of face){
                facesAroundVertex[vi].push(fi);
            }
        }

        // helper: sort face-centroids around the vertex to produce ordered pentagon
        function sortFacesAroundVertex(vIdx){
            const center = V[vIdx];
            // build local tangent basis
            const n = [center[0], center[1], center[2]];
            const nlen = Math.hypot(n[0], n[1], n[2]);
            n[0]/=nlen; n[1]/=nlen; n[2]/=nlen;

            // pick arbitrary reference vector not parallel to n
            let ref = Math.abs(n[0]) < 0.9 ? [1,0,0] : [0,1,0];
            // u = normalize(cross(ref, n))
            const u = [ ref[1]*n[2]-ref[2]*n[1], ref[2]*n[0]-ref[0]*n[2], ref[0]*n[1]-ref[1]*n[0] ];
            const ulen = Math.hypot(u[0], u[1], u[2]);
            u[0]/=ulen; u[1]/=ulen; u[2]/=ulen;
            // v = cross(n, u)
            const v = [ n[1]*u[2]-n[2]*u[1], n[2]*u[0]-n[0]*u[2], n[0]*u[1]-n[1]*u[0] ];

            // for each adjacent face, compute vector from vertex to centroid and project
            const adjacentFaces = facesAroundVertex[vIdx];
            const entries = adjacentFaces.map(fi => {
                const cen = dodecaVertices[fi];
                const rel = [ cen[0]-center[0], cen[1]-center[1], cen[2]-center[2] ];
                // project onto (u,v)
                const x = rel[0]*u[0] + rel[1]*u[1] + rel[2]*u[2];
                const y = rel[0]*v[0] + rel[1]*v[1] + rel[2]*v[2];
                const ang = Math.atan2(y, x);
                return {fi, ang};
            });

            entries.sort((a,b)=>a.ang - b.ang);
            return entries.map(e=>e.fi);
        }

        // build dodecahedron faces (as pentagons) then triangulate
        const dodecaFaces = [];
        for(let vi=0; vi<V.length; vi++){
            const ordered = sortFacesAroundVertex(vi);
            if(ordered.length < 3) continue;
            // triangulate fan around first
            for(let k=1; k+1<ordered.length; k++){
                dodecaFaces.push([ ordered[0], ordered[k], ordered[k+1] ]);
            }
        }

        return { geometry: dodecaVertices, topology: dodecaFaces };
    }

    function drawIcosahedron(){
        const PHI = (1 + Math.sqrt(5)) / 2;

        // Geometry list
        let icosaVertices = [
            [ 0,  -1,  -PHI],
            [ 0,   1,  -PHI],
            [ 0,  -1,   PHI],
            [ 0,   1,   PHI],

            [-1, -PHI, 0],
            [ 1, -PHI, 0],
            [-1,  PHI, 0],
            [ 1,  PHI, 0],

            [-PHI, 0, -1],
            [-PHI, 0,  1],
            [ PHI, 0, -1],
            [ PHI, 0,  1]
        ];

        // Topology list
        let icosaFaces = [
            [ 0,  1, 10], [ 0, 10,  5], [ 0,  5,  4], 
            [ 0,  4,  8], [ 0,  8,  1], [ 3,  2, 11], 
            [ 3, 11,  7], [ 3,  7,  6], [ 3,  6,  9], 
            [ 3,  9,  2], [ 1,  8,  6], [ 1,  6,  7], 
            [ 1,  7, 10], [ 2,  9,  4], [ 2,  4,  5], 
            [ 2,  5, 11], [ 8,  4,  9], [ 9,  6,  8],
            [ 5, 10, 11], [ 11,  7, 10]
        ];

        // normalize vertices to unit radius to make sphere subdivision and dual construction stable
        for(let i=0;i<icosaVertices.length;i++){
            const v = icosaVertices[i];
            const len = Math.hypot(v[0], v[1], v[2]);
            icosaVertices[i] = [v[0]/len, v[1]/len, v[2]/len];
        }

        return { geometry: icosaVertices, topology: icosaFaces };
    }

    function drawSphere(subdivisionLevel = 2){
    // Getting the base blueprint. Clone arrays so we don't mutate the original icosahedron
    let base = drawIcosahedron();
    let vertices = base.geometry.map(v => v.slice());
    let faces = base.topology.map(f => f.slice());

        // Storing the midpoints.
        let midPointCache = new Map();

        // Helper function to create a normalized midpoint.
        function getMidpoint(v1, v2){
            // Creating a unique key for this edge.
            let key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;

            // Check if we already computed this midpoint.
            if(midPointCache.has(key)){
                return midPointCache.get(key);
            }

            // if not in cache, compute it.
            let vert1 = vertices[v1];
            let vert2 = vertices[v2];

            // Calculate midpoint.
            let mid = [
                (vert1[0] + vert2[0]) / 2,
                (vert1[1] + vert2[1]) / 2,
                (vert1[2] + vert2[2]) / 2
            ];

            // Normalize the midpoint to the sphere's surface.
            const LENGTH = Math.sqrt(mid[0] * mid[0] + mid[1] * mid[1] + mid[2] * mid[2]);
            const NORMALIZED_MID = [
                mid[0] / LENGTH,
                mid[1] / LENGTH,
                mid[2] / LENGTH
            ];

            // Add the new normalized midpoint to our main list.
            vertices.push(NORMALIZED_MID);
            const NEW_INDEX = vertices.length -1;

            // Store new index in cache.
            midPointCache.set(key, NEW_INDEX);

            return NEW_INDEX;
        }

        // Repeat for each subdivision level.
        for (let i = 0; i < subdivisionLevel; i++){
            let newFaces = [];

            // Loop through all current faces.
            for (let face of faces){
                let v1 = face[0];
                let v2 = face[1];
                let v3 = face[2];

                // Get midpoints for each edge.
                let m1 = getMidpoint(v1, v2);
                let m2 = getMidpoint(v2, v3);
                let m3 = getMidpoint(v3, v1);

                // Add 4 new triangles to our new list.
                newFaces.push([v1, m1, m3]);
                newFaces.push([m1, v2, m2]);
                newFaces.push([m3, m2, v3]);
                newFaces.push([m1, m2, m3]);
            }

            // The new faces become the list for the next iteration.
            faces = newFaces;
        }

        return {
            geometry: vertices,
            topology: faces
        };
    }

    // Helper functions
    function makeShape(faces, vertices, model, getNormals){
        let buffer = [],
            colorArray = [],
            shape = {};

        // Helper: convert HSV (h in [0,1], s,v in [0,1]) to RGB
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

        // Build face adjacency via edges (map edge -> faces that share it).
        const nFaces = faces.length;
        const edgeMap = new Map();
        faces.forEach((face, fi) => {
            for(let e=0;e<3;e++){
                const a = Math.min(face[e], face[(e+1)%3]);
                const b = Math.max(face[e], face[(e+1)%3]);
                const key = `${a}-${b}`;
                if(!edgeMap.has(key)) edgeMap.set(key, []);
                edgeMap.get(key).push(fi);
            }
        });

        // adjacency sets per face
        const adj = new Array(nFaces).fill(0).map(()=> new Set());
        for(const [key, arr] of edgeMap.entries()){
            if(arr.length > 1){
                for(let i=0;i<arr.length;i++){
                    for(let j=i+1;j<arr.length;j++){
                        adj[arr[i]].add(arr[j]);
                        adj[arr[j]].add(arr[i]);
                    }
                }
            }
        }

        // greedy graph coloring (colors are integers starting from 0)
        const faceColorIdx = new Array(nFaces).fill(-1);
        for(let fi=0; fi<nFaces; fi++){
            const used = {};
            adj[fi].forEach(nb => {
                const idx = faceColorIdx[nb];
                if(idx !== -1) used[idx] = true;
            });
            let c = 0;
            while(used[c]) c++;
            faceColorIdx[fi] = c;
        }

        const nColorsUsed = Math.max(...faceColorIdx) + 1;

        // assign RGB per face from HSV palette based on assigned color index
        faces.forEach((face, faceIdx) => {
            const color = hsvToRgb(faceColorIdx[faceIdx] / Math.max(1, nColorsUsed), 0.65, 0.95);
            face.forEach(index => {
                buffer.push(...vertices[index]);
                colorArray.push(...color);
            });
        });

        shape.model = model;
        shape.vertexBuffer = makeBuffer(gl, buffer);
        shape.colorBuffer = makeBuffer(gl, colorArray);
        // store vertex count (3 vertices per face)
        shape.vertexCount = buffer.length / 3;
        shape.nFaces = faces.length;

        return shape;
    }
    function makeBuffer(gl, data){
        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        return buffer;
    }

    function loadShader(gl, type, source){
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        return shader;
    }

    function initShaderProgram(gl, vsSource, fsSource){
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        return shaderProgram;
    }

    // rotation state controlled by UI
    let rotX = 0.0;
    let rotY = 0.0;
    // allow stopping the main draw loop when another scene takes over
    window.__mainLoopRunning = true;

    window.stopMainScene = function(){ window.__mainLoopRunning = false; };

    function drawScene(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(shaderProgram);

        gl.uniformMatrix4fv(uViewLocation, false, viewMatrix);
        gl.uniformMatrix4fv(uProjectionLocation, false, projectionMatrix);

        for(let shape of mySceneObjects){
            // apply rotation state on top of the shape's model matrix
            let model = mat4.clone(shape.model);
            mat4.rotateX(model, model, rotX);
            mat4.rotateY(model, model, rotY);

            gl.uniformMatrix4fv(uModelLocation, false, model);

            gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);

            gl.vertexAttribPointer(
                aPositionLocation,
                3,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(aPositionLocation);

            // bind color buffer and set attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, shape.colorBuffer);
            gl.vertexAttribPointer(
                aColorLocation,
                3,
                gl.FLOAT,
                false,
                0,
                0
            );
            gl.enableVertexAttribArray(aColorLocation);

            // draw filled triangles (3 vertices per face)
            gl.drawArrays(gl.TRIANGLES, 0, shape.vertexCount);
        }

    if(window.__mainLoopRunning) requestAnimationFrame(drawScene);
    }

    // Getting canvas and webgl context
    const canvas = this.document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");

    // Basic GL setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    const shaderProgram = initShaderProgram(gl, vertShaderSrc, fragShaderSrc);

    // Get locations for shader variables
    const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    const aColorLocation = gl.getAttribLocation(shaderProgram, "aColor");
    const uModelLocation = gl.getUniformLocation(shaderProgram, "uModel");
    const uViewLocation = gl.getUniformLocation(shaderProgram, "uView");
    const uProjectionLocation = gl.getUniformLocation(shaderProgram, "uProjection");

    // Define scene objects
    // view matrix
    const viewMatrix  = mat4.create();
    const cameraPosition = [0, 0, 6];
    const centerOfInterest = [0, 0, 0];
    const upVector = [0, 1, 0];
    mat4.lookAt(viewMatrix, cameraPosition, centerOfInterest, upVector);

    // projection matrix
    const projectionMatrix = mat4.create();
    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspectRatio = gl.canvas.width / gl.canvas.height;
    const nearClip = 0.1;
    const farClip = 100.0;
    mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, nearClip, farClip);

    // Scene array.
    let mySceneObjects = [];
    // Scene setup helper: build scene for selected shape
    let currentShapeName = 'cube';

    function buildSceneForShape(name){
        currentShapeName = name;
        // clear existing objects
        mySceneObjects.length = 0;

        // get blueprint based on name
        let blueprint;
        if(name === 'cube') blueprint = drawCube();
        else if(name === 'tetra') blueprint = drawTetrahedron();
        else if(name === 'octa') blueprint = drawOctahedron();
        else if(name === 'dodeca') blueprint = drawDodecahedron();
        else if(name === 'icosa') blueprint = drawIcosahedron();
        else if(name === 'sphere') blueprint = drawSphere(2); // default subdivision
        else blueprint = drawCube();

        // create model matrix centered at origin
        let model = mat4.create();
        mat4.translate(model, model, [0.0, 0.0, 0.0]);
        mat4.scale(model, model, [1.0, 1.0, 1.0]);

        let obj = makeShape(blueprint.topology, blueprint.geometry, model);
        mySceneObjects.push(obj);
    }

    // wire UI buttons after scene objects exist
    const STEP = 0.15; // radians per click

    function q(id){ return document.getElementById(id); }

    q('rot-left').addEventListener('click', () => { rotY -= STEP; });
    q('rot-right').addEventListener('click', () => { rotY += STEP; });
    q('rot-up').addEventListener('click', () => { rotX -= STEP; });
    q('rot-down').addEventListener('click', () => { rotX += STEP; });
    q('reset').addEventListener('click', () => { rotX = 0; rotY = 0; });

    // shape selector wiring
    const shapeSelect = q('shape-select');
    if(shapeSelect){
        shapeSelect.value = currentShapeName;
        shapeSelect.addEventListener('change', (e) => {
            buildSceneForShape(e.target.value);
        });
    }


    
    // build initial scene
    buildSceneForShape(currentShapeName);

    // expose blueprints so other modules (e.g. Scene.js) can build scenes
    window.blueprints = {
        cube: drawCube,
        tetra: drawTetrahedron,
        octa: drawOctahedron,
        dodeca: drawDodecahedron,
        icosa: drawIcosahedron,
        sphere: drawSphere
    };

    drawScene();
}
