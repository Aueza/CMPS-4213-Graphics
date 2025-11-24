// Scene partition: blueprints, shape builders, and render loop
(function(window){
    const Scene = {};

    // internal state
    let gl = null;
    let shaderProgram = null;
    let aPositionLocation, aColorLocation, aNormalLocation;
    let uModelLocation, uViewLocation, uProjectionLocation, uNormalMatrixLocation;
    let uLightPosLocation, uIllumModelLocation;
    let viewMatrix = null;
    let projectionMatrix = null;

    // rotation / light state
    let rotX = 0.0, rotY = 0.0;
    let autoRotate = false; 
    let rotSpeed = 0.01;
    window.__mainLoopRunning = true;
    let lightRotate = false;
    let lightAngle = 0.0;
    const baseLight = [4.0, 4.0, 4.0];
    let illumModel = 2.0;

    let mySceneObjects = [];
    let currentShapeName = 'cube';

    // Blueprints from Assignment 3.
    function drawCube(){
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
        let cubeFaces = [
            [0, 1, 2],[0, 2, 3],
            [4, 5, 6],[4, 6, 7],
            [3, 2, 6],[3, 6, 7],
            [0, 1, 5],[0, 5, 4],
            [0, 4, 7],[0, 7, 3],
            [1, 5, 6],[1, 6, 2]
        ];
        return { geometry: cubeVertices, topology: cubeFaces };
    }

    function drawTetrahedron(){
        let tetraVertices = [ [ 1,  1,  1],[-1, -1,  1],[-1,  1, -1],[ 1, -1, -1] ];
        let tetraFaces = [ [0,1,2],[0,2,3],[0,3,1],[1,3,2] ];
        return { geometry: tetraVertices, topology: tetraFaces };
    }

    function drawOctahedron(){
        let octaVertices = [ [0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1] ];
        let octaFaces = [ [0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,4,2],[1,3,4],[1,5,3],[1,2,5] ];
        return { geometry: octaVertices, topology: octaFaces };
    }

    function drawIcosahedron(){
        const PHI = (1 + Math.sqrt(5)) / 2;
        let icosaVertices = [
            [ 0,  -1,  -PHI],[ 0,   1,  -PHI],
            [ 0,  -1,   PHI],[ 0,   1,   PHI],
            [-1, -PHI, 0],[ 1, -PHI, 0],
            [-1,  PHI, 0],[ 1,  PHI, 0],
            [-PHI, 0, -1],[-PHI, 0,  1],
            [ PHI, 0, -1],[ PHI, 0,  1]
        ];

        let icosaFaces = [ [ 0,  1, 10], [ 0, 10,  5], 
                        [ 0,  5,  4], [ 0,  4,  8], 
                        [ 0,  8,  1], [ 3,  2, 11], 
                        [ 3, 11,  7], [ 3,  7,  6], 
                        [ 3,  6,  9], [ 3,  9,  2],
                        [ 1,  8,  6], [ 1,  6,  7], 
                        [ 1,  7, 10], [ 2,  9,  4], 
                        [ 2,  4,  5], [ 2,  5, 11],
                        [ 8,  4,  9], [ 9,  6,  8],
                        [ 5, 10, 11], [ 11,  7, 10]
        ];

        for(let i=0;i<icosaVertices.length;i++){
            const v = icosaVertices[i];
            const len = Math.hypot(v[0], v[1], v[2]);
            icosaVertices[i] = [v[0]/len, v[1]/len, v[2]/len]; 
        }

        return { geometry: icosaVertices, topology: icosaFaces };
    }

    function drawDodecahedron(){
        const icosa = drawIcosahedron();
        const V = icosa.geometry; 
        const F = icosa.topology;
        function faceCentroid(face){
            const a = V[face[0]], b = V[face[1]], c = V[face[2]];
            return [ (a[0]+b[0]+c[0])/3, (a[1]+b[1]+c[1])/3, (a[2]+b[2]+c[2])/3 ];
        }

        const dodecaVertices = F.map(face => { 
            const c = faceCentroid(face); 
            const len = Math.hypot(c[0], c[1], c[2]); 
            return [c[0]/len, c[1]/len, c[2]/len];});

        const facesAroundVertex = new Array(V.length).fill(0).map(()=>[]);
        for(let fi=0; fi<F.length; fi++){
            const face = F[fi];
            for(const vi of face){
                facesAroundVertex[vi].push(fi);
            }
        }

        function sortFacesAroundVertex(vIdx){
            const center = V[vIdx];
            const n = [center[0], center[1], center[2]];
            const nlen = Math.hypot(n[0], n[1], n[2]);

            n[0]/=nlen;
            n[1]/=nlen;
            n[2]/=nlen;

            let ref = Math.abs(n[0]) < 0.9 ? [1,0,0] : [0,1,0];
            const u = [ref[1]*n[2]-ref[2]*n[1], ref[2]*n[0]-ref[0]*n[2], ref[0]*n[1]-ref[1]*n[0]];
            const ulen = Math.hypot(u[0], u[1], u[2]);

            u[0]/= ulen;
            u[1]/= ulen;
            u[2]/= ulen;

            const v = [n[1]*u[2]-n[2]*u[1], n[2]*u[0]-n[0]*u[2], n[0]*u[1]-n[1]*u[0]];
            const adjacentFaces = facesAroundVertex[vIdx];
            const entries = adjacentFaces.map(fi => { 
                const cen = dodecaVertices[fi];
                const rel = [cen[0]-center[0], cen[1]-center[1], cen[2]-center[2]];
                const x = rel[0]*u[0] + rel[1]*u[1] + rel[2]*u[2];
                const y = rel[0]*v[0] + rel[1]*v[1] + rel[2]*v[2];
                const ang = Math.atan2(y, x);
                return {fi, ang}; });
                entries.sort((a,b)=>a.ang - b.ang);
                return entries.map(e=>e.fi);
            }
        const dodecaFaces = [];

        for(let vi=0; vi<V.length; vi++){
            const ordered = sortFacesAroundVertex(vi); 
            if(ordered.length < 3) 
                continue; 
            for(let k=1; k+1<ordered.length; k++){
                dodecaFaces.push([ordered[0], ordered[k], ordered[k+1]]); 
            } 
        }

        return { geometry: dodecaVertices, topology: dodecaFaces };
    }

    function drawSphere(subdivisionLevel = 2){
        let base = drawIcosahedron();
        let vertices = base.geometry.map(v => v.slice());
        let faces = base.topology.map(f => f.slice());
        let midPointCache = new Map();

        function getMidpoint(v1, v2){
            let key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
            if(midPointCache.has(key))
                return midPointCache.get(key);

            let vert1 = vertices[v1];
            let vert2 = vertices[v2];
            let mid = [(vert1[0] + vert2[0]) / 2, (vert1[1] + vert2[1]) / 2, (vert1[2] + vert2[2]) / 2];

            const LENGTH = Math.sqrt(mid[0] * mid[0] + mid[1] * mid[1] + mid[2] * mid[2]);
            const NORMALIZED_MID = [ mid[0] / LENGTH, mid[1] / LENGTH, mid[2] / LENGTH ];
            vertices.push(NORMALIZED_MID);

            const NEW_INDEX = vertices.length -1;
            midPointCache.set(key, NEW_INDEX);

            return NEW_INDEX;
        }

        for (let i = 0; i < subdivisionLevel; i++){
            let newFaces = [];
            for (let face of faces){
                let v1 = face[0];
                let v2 = face[1];
                let v3 = face[2];

                let m1 = getMidpoint(v1, v2);
                let m2 = getMidpoint(v2, v3);
                let m3 = getMidpoint(v3, v1);

                newFaces.push([v1, m1, m3]);
                newFaces.push([m1, v2, m2]);
                newFaces.push([m3, m2, v3]);
                newFaces.push([m1, m2, m3]);
            }
            faces = newFaces;}
        return { geometry: vertices, topology: faces };
    }

    // helpers
    function makeBuffer(glctx, data){
        const buffer = glctx.createBuffer();
        glctx.bindBuffer(glctx.ARRAY_BUFFER, buffer);
        glctx.bufferData(glctx.ARRAY_BUFFER, new Float32Array(data), glctx.STATIC_DRAW);
        return buffer;
    }

    function makeShape(faces, vertices, model){
        console.log('makeShape: building shape from', faces.length, 'faces and', vertices.length, 'vertices');
        let buffer = [], colorArray = [], normalArray = [], shape = {};

        function hsvToRgb(h, s, v){
            let r=0,g=0,b=0;
            const i = Math.floor(h*6);
            const f = h*6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f*s);
            const t = v * (1 - (1 - f) * s);

            switch(i % 6){
                case 0:
                    r=v;
                    g=t;
                    b=p;
                    break;
                case 1:
                    r=q;
                    g=v;
                    b=p;
                    break;
                case 2:
                    r=p;
                    g=v;
                    b=t;
                    break;
                case 3:
                    r=p;
                    g=q;
                    b=v;
                    break;
                case 4:
                    r=t;
                    g=p;
                    b=v;
                    break;
                case 5:
                    r=v;
                    g=p;
                    b=q;
                    break;
            } 
            return [r,g,b]; 
        }

        const nFaces = faces.length;
        const edgeMap = new Map();

        faces.forEach((face, fi) => {
            for(let e=0;e<3;e++){
                const a = Math.min(face[e], face[(e+1)%3]);
                const b = Math.max(face[e], face[(e+1)%3]);
                const key = `${a}-${b}`;
                if(!edgeMap.has(key))
                    edgeMap.set(key, []);
                    edgeMap.get(key).push(fi);}});
        const adj = new Array(nFaces).fill(0).map(()=> new Set());

        for(const [key, arr] of edgeMap.entries()){
            if(arr.length > 1){
                for(let i=0;i<arr.length;i++){
                    for(let j=i+1;j<arr.length;j++){
                        adj[arr[i]].add(arr[j]);
                        adj[arr[j]].add(arr[i]);}}}}

        const faceColorIdx = new Array(nFaces).fill(-1);

        for(let fi=0; fi<nFaces; fi++){
            const used = {}; adj[fi].forEach(nb => {
                const idx = faceColorIdx[nb];
                if(idx !== -1)
                    used[idx] = true; });
                    let c = 0; while(used[c]) c++;
                    faceColorIdx[fi] = c;}

        const nColorsUsed = Math.max(...faceColorIdx) + 1;

        faces.forEach((face, faceIdx) => {
            // compute face normal
            const color = hsvToRgb(faceColorIdx[faceIdx] / Math.max(1, nColorsUsed), 0.65, 0.95);
            const v0 = vertices[face[0]];
            const v1 = vertices[face[1]];
            const v2 = vertices[face[2]];
            const e1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]];
            const e2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]];

            // cross product
            let nx = e1[1]*e2[2] - e1[2]*e2[1];
            let ny = e1[2]*e2[0] - e1[0]*e2[2];
            let nz = e1[0]*e2[1] - e1[1]*e2[0];

            // normalize
            let len = Math.hypot(nx, ny, nz) || 1.0;
            nx /= len;
            ny /= len;
            nz /= len;

            // ensure normal points outward
            const cx = (v0[0] + v1[0] + v2[0]) / 3;
            const cy = (v0[1] + v1[1] + v2[1]) / 3;
            const cz = (v0[2] + v1[2] + v2[2]) / 3;
            const dot = nx*cx + ny*cy + nz*cz;
            if(dot < 0){
                nx = -nx;
                ny = -ny;
                nz = -nz;
            }
            // append vertices, colors, normals
            face.forEach(index => {
                buffer.push(...vertices[index]);
                colorArray.push(...color);
                normalArray.push(nx, ny, nz);});
        });

        // create buffers
        shape.model = model;
        shape.vertexBuffer = makeBuffer(gl, buffer);
        shape.colorBuffer = makeBuffer(gl, colorArray);
        shape.normalBuffer = makeBuffer(gl, normalArray);
        shape.vertexCount = buffer.length / 3;
        shape.nFaces = faces.length;
        console.log('makeShape: created buffers, vertexCount =', shape.vertexCount);
        return shape;
    }

    function drawScene(){
        try{
            // ensure viewport matches canvas size
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.18, 0.18, 0.18, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.useProgram(shaderProgram);
        
            // update rotation
            if(autoRotate){
                rotY += rotSpeed;
            }
            let currentLightPos = baseLight.slice();
            // update light position
            if(lightRotate){ 
                lightAngle += 0.02; 
                const s = Math.sin(lightAngle), c = Math.cos(lightAngle); 
                const x = baseLight[0] * c - baseLight[2] * s; 
                const z = baseLight[0] * s + baseLight[2] * c; 
                currentLightPos = [x, baseLight[1], z]; 
            }
            // upload common uniforms
            gl.uniform3fv(uLightPosLocation, new Float32Array(currentLightPos));
            gl.uniform1f(uIllumModelLocation, illumModel);
            gl.uniformMatrix4fv(uViewLocation, false, viewMatrix);
            gl.uniformMatrix4fv(uProjectionLocation, false, projectionMatrix);

            // draw each object
            for(let shape of mySceneObjects){
                let model = mat4.clone(shape.model);
                // apply rotation
                mat4.rotateX(model, model, rotX);
                mat4.rotateY(model, model, rotY);
                
                // upload model matrix and normal matrix
                gl.uniformMatrix4fv(uModelLocation, false, model);
                const normalMatrix = mat3.create();
                mat3.normalFromMat4(normalMatrix, model);
                gl.uniformMatrix3fv(uNormalMatrixLocation, false, normalMatrix);

                // bind buffers and draw
                gl.bindBuffer(gl.ARRAY_BUFFER, shape.vertexBuffer);
                gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPositionLocation);

                // bind normal buffer
                if(shape.normalBuffer){
                    gl.bindBuffer(gl.ARRAY_BUFFER, shape.normalBuffer); 
                    gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0); 
                    gl.enableVertexAttribArray(aNormalLocation); 
                }

                // bind color buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, shape.colorBuffer);
                gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aColorLocation);

                // draw arrays
                gl.drawArrays(gl.TRIANGLES, 0, shape.vertexCount);
            }

            // report GL errors if any
            const err = gl.getError();
            if(err !== gl.NO_ERROR) console.warn('GL error code:', err);

            // request next frame
            if(window.__mainLoopRunning)requestAnimationFrame(drawScene);
        }   
            catch(err){
                console.error('drawScene error:', err);
                // stop loop to avoid spamming errors
                window.__mainLoopRunning = false;
            }
    }

    // scene public API
    Scene.init = function(opts){
        gl = opts.gl;
        shaderProgram = opts.shaderProgram;

        // Re-query attribute/uniform locations from the program.
        aPositionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
        aColorLocation = gl.getAttribLocation(shaderProgram, 'aColor');
        aNormalLocation = gl.getAttribLocation(shaderProgram, 'aNormal');
        uModelLocation = gl.getUniformLocation(shaderProgram, 'uModel');
        uViewLocation = gl.getUniformLocation(shaderProgram, 'uView');
        uProjectionLocation = gl.getUniformLocation(shaderProgram, 'uProjection');
        uNormalMatrixLocation = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
        uLightPosLocation = gl.getUniformLocation(shaderProgram, 'uLightPos');
        uIllumModelLocation = gl.getUniformLocation(shaderProgram, 'uIllumModel');

        // material/uniform locations
        const extra = opts.uniforms || {};
        Scene._uKa = extra.uKaLocation || null;
        Scene._uKd = extra.uKdLocation || null;
        Scene._uKs = extra.uKsLocation || null;
        Scene._uShininess = extra.uShininessLocation || null;
        Scene._uAmbient = extra.uAmbientLocation || null;
        Scene._uViewPos = extra.uViewPosLocation || null;
        viewMatrix = opts.viewMatrix;
        projectionMatrix = opts.projectionMatrix;
        Scene._initialized = true;
        console.log('Scene.init: initialized');
        // Debug: print attribute/uniform locations
        console.log('attrib locations:', {
            aPositionLocation, aColorLocation, aNormalLocation
        });
        console.log('uniform locations:', {
            uModelLocation, uViewLocation, uProjectionLocation, uNormalMatrixLocation, uLightPosLocation, uIllumModelLocation
        });
    };

    // Set material either by name (looks up window.materials) or by material object
    Scene.setMaterial = function(mat){
        let m = null;
        if(!mat){
            return;
        }

        // look up material by name
        if(typeof mat === 'string'){
            if(typeof window.materials !== 'undefined'){
                const keys = Object.keys(window.materials);
                const found = keys.find(k => k.toLowerCase() === mat.toLowerCase());
                if(found){
                    m = window.materials[found];
                } 
            }
        } else if(typeof mat === 'object'){
            m = mat;
        }

        if(!m){
            return console.warn('Scene.setMaterial: material not found:', mat);
        }
        // upload material properties to shader uniforms
        try{
            if(Scene._uKa){
                gl.uniform3fv(Scene._uKa, new Float32Array((m.Ambient||[0,0,0]).slice(0,3)));
            }
            if(Scene._uKd){
                gl.uniform3fv(Scene._uKd, new Float32Array((m.Diffuse||[0,0,0]).slice(0,3)));
            }
            if(Scene._uKs){
                gl.uniform3fv(Scene._uKs, new Float32Array((m.Specular||[0,0,0]).slice(0,3)));
            }
            if(Scene._uShininess){
                gl.uniform1f(Scene._uShininess, m.Shininess || m.shininess || 32.0);
            }
            }catch(err){
                console.warn('Scene.setMaterial upload failed:', err); }
    };

    // Build a small lit rotating cube scene and start rendering
    Scene.buildRotatingCubeScene = function(materialName){
        autoRotate = true;
        rotSpeed = 0.02;
        Scene.buildSceneForShape('cube');
        if(materialName){
            Scene.setMaterial(materialName);
        }
        Scene.start();
    };

    Scene.buildSceneForShape = function(name){
        console.log('buildSceneForShape:', name);
        currentShapeName = name;
        mySceneObjects.length = 0;
        let blueprint;

        // select blueprint
        if(name === 'cube'){
            blueprint = drawCube();
        }
        else if(name === 'tetra'){
            blueprint = drawTetrahedron();
        }
        else if(name === 'octa'){
            blueprint = drawOctahedron();
        }
        else if(name === 'dodeca'){
            blueprint = drawDodecahedron();
        }
        else if(name === 'icosa'){
            blueprint = drawIcosahedron();
        }
        else if(name === 'sphere'){
            blueprint = drawSphere(2);
        }
        else {
            blueprint = drawCube();
        }

        // build shape
        let model = mat4.create(); 
        mat4.translate(model, model, [0.0, 0.0, 0.0]); 
        mat4.scale(model, model, [1.0, 1.0, 1.0]);
        let obj = makeShape(blueprint.topology, blueprint.geometry, model);
        mySceneObjects.push(obj);
        console.log('buildSceneForShape: pushed object, total objects =', mySceneObjects.length);
    };

    Scene.start = function(){
        if(!Scene._initialized){ console.warn('Scene.start called before Scene.init'); return; }
        window.__mainLoopRunning = true;
        console.log('Scene.start: starting render loop');
        requestAnimationFrame(drawScene);
    };
    Scene.stop = function(){ window.__mainLoopRunning = false; console.log('Scene.stop: stopping render loop'); };

    Scene.blueprints = { cube: drawCube, tetra: drawTetrahedron, octa: drawOctahedron, dodeca: drawDodecahedron, icosa: drawIcosahedron, sphere: drawSphere };

    // wire UI controls (rot buttons, shape select, keyboard) after DOM ready
    function q(id){ return document.getElementById(id); }

    function setupUI(){
        // rotation buttons
        const STEP = 0.15;
        const rl = q('rot-left'); 
        if(rl) rl.addEventListener('click', () => { rotY -= STEP; });

        const rr = q('rot-right'); 
        if(rr) rr.addEventListener('click', () => { rotY += STEP; });

        const ru = q('rot-up'); 
        if(ru) ru.addEventListener('click', () => { rotX -= STEP; });

        const rd = q('rot-down'); 
        if(rd) rd.addEventListener('click', () => { rotX += STEP; });

        const rs = q('reset'); 
        if(rs) rs.addEventListener('click', () => { rotX = 0; rotY = 0; });

        const shapeSelect = q('shape-select'); 
        if(shapeSelect){
            shapeSelect.value = currentShapeName; shapeSelect.addEventListener('change', (e)=>{ Scene.buildSceneForShape(e.target.value); }); 
        }
        window.addEventListener('keydown', (e) => {
            if(!e || !e.key) return; const k = e.key;
            if(k >= '1' && k <= '6'){ 
                const map = { '1':'cube','2':'tetra','3':'octa','4':'dodeca','5':'icosa','6':'sphere'}; 
                Scene.buildSceneForShape(map[k]); 
            }   
            else if(k === 'r'){ 
                autoRotate = !autoRotate; console.log('autoRotate =', autoRotate); 
            }
            else if(k === 'l'){
                lightRotate = !lightRotate; console.log('lightRotate =', lightRotate); 
            }
            else if(k === 'm'){
                illumModel = (illumModel + 1.0) % 3.0; console.log('illumModel =', illumModel); 
            }
        });
        const renderBtn = q('render-scene'); 
        if(renderBtn){ renderBtn.addEventListener('click', () => {
            if(!Scene._initialized){ console.warn('Render button pressed but Scene not initialized yet.'); return; }
            // Build a rotating cube scene when the button is pressed (start auto-rotation)
            autoRotate = true;
            rotSpeed = 0.02;
            Scene.buildRotatingCubeScene();
        }); }
    }

    if(document.readyState === 'complete' || document.readyState === 'interactive'){
        setupUI();
    }
    else{
        window.addEventListener('DOMContentLoaded', setupUI);
    }

    window.Scene = Scene;
})(window);

