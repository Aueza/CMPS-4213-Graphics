// Vertex shader (passes position and normal in world space to fragment shader)
const vertShaderSrc = 
`attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uNormalMatrix;

void main(){
    vColor = aColor;
    // position in world (model) space
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vPosition = worldPos.xyz;
    // transform normal using normal matrix
    vNormal = normalize(uNormalMatrix * aNormal);
    gl_Position = uProjection * uView * worldPos;
}`;

// Fragment shader
const fragShaderSrc = 
`precision mediump float;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uLightPos;    // world-space light position
uniform vec3 uViewPos;     // world-space camera position
uniform vec3 uKa;          // ambient material
uniform vec3 uKd;          // diffuse material
uniform vec3 uKs;          // specular material
uniform float uShininess;  // shininess
uniform vec3 uAmbientLight; // ambient light color
uniform float uIllumModel; // 0=Lambert, 1=Phong, 2=Blinn

void main(){
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightPos - vPosition);
    vec3 V = normalize(uViewPos - vPosition);

    // Ambient term
    vec3 ambient = uAmbientLight * uKa;

    // Diffuse term (Lambert)
    float NdotL = max(dot(N, L), 0.0);
    vec3 diffuse = uKd * NdotL;

    // Specular term: switch between Phong (reflect) and Blinn
    vec3 specular = vec3(0.0);
    if(uIllumModel < 0.5){
        // Lambert only (no specular)
        specular = vec3(0.0);
    } else if(uIllumModel < 1.5){
        // Phong (reflect-based)
        vec3 R = normalize(reflect(-L, N));
        float RdotV = max(dot(R, V), 0.0);
        specular = uKs * pow(RdotV, uShininess);
    } else {
        // Blinn-Phong (half-vector)
        vec3 H = normalize(L + V);
        float NdotH = max(dot(N, H), 0.0);
        specular = uKs * pow(NdotH, uShininess);
    }

    vec3 color = ambient + diffuse + specular;
    // optional: modulate by vertex color for visualization
    // color *= vColor;

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}`;

// Main entry point
window.onload = function main(){
    const canvas = this.document.getElementById("glCanvas");
    window.gl = canvas.getContext("webgl");
    const gl = window.gl;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // create GL program using helper from `lib.js`
    const shaderProgram = createProgram(vertShaderSrc, fragShaderSrc);

    // Get locations for shader variables
    const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    const aColorLocation = gl.getAttribLocation(shaderProgram, "aColor");
    const aNormalLocation = gl.getAttribLocation(shaderProgram, "aNormal");
    const uModelLocation = gl.getUniformLocation(shaderProgram, "uModel");
    const uViewLocation = gl.getUniformLocation(shaderProgram, "uView");
    const uProjectionLocation = gl.getUniformLocation(shaderProgram, "uProjection");
    const uNormalMatrixLocation = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
    const uLightPosLocation = gl.getUniformLocation(shaderProgram, "uLightPos");
    const uViewPosLocation = gl.getUniformLocation(shaderProgram, "uViewPos");
    const uKaLocation = gl.getUniformLocation(shaderProgram, "uKa");
    const uKdLocation = gl.getUniformLocation(shaderProgram, "uKd");
    const uKsLocation = gl.getUniformLocation(shaderProgram, "uKs");
    const uShininessLocation = gl.getUniformLocation(shaderProgram, "uShininess");
    const uAmbientLocation = gl.getUniformLocation(shaderProgram, "uAmbientLight");
    const uIllumModelLocation = gl.getUniformLocation(shaderProgram, "uIllumModel");

    // view/projection
    const viewMatrix  = mat4.create();
    const cameraPosition = [0, 0, 6];
    mat4.lookAt(viewMatrix, cameraPosition, [0,0,0], [0,1,0]);
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

    // --- Lighting / Material setup (Phong params)
    let currentMaterial = 'Gold';
    const lightPos = [4.0, 4.0, 4.0];
    const ambientLight = [0.05, 0.05, 0.05];

    // helper to apply material properties from external `materials` by name
    function applyMaterial(name){
        if(typeof materials === 'undefined') return;
        let m = materials[name];
        if(!m){ const keys = Object.keys(materials); const found = keys.find(k => k.toLowerCase() === String(name).toLowerCase()); if(found) m = materials[found]; }
        if(!m) return;
        const ka = (m.Ambient || [0,0,0]).slice(0,3);
        const kd = (m.Diffuse || [0,0,0]).slice(0,3);
        const ks = (m.Specular || [0,0,0]).slice(0,3);
        const shininess = m.Shininess || (m.shininess || 32.0);
        gl.useProgram(shaderProgram);
        gl.uniform3fv(uKaLocation, new Float32Array(ka));
        gl.uniform3fv(uKdLocation, new Float32Array(kd));
        gl.uniform3fv(uKsLocation, new Float32Array(ks));
        gl.uniform1f(uShininessLocation, shininess);
    }

    // bind static uniforms
    gl.useProgram(shaderProgram);
    gl.uniform3fv(uLightPosLocation, new Float32Array(lightPos));
    gl.uniform3fv(uAmbientLocation, new Float32Array(ambientLight));
    gl.uniform3fv(uViewPosLocation, new Float32Array(cameraPosition));
    applyMaterial(currentMaterial);

    // Populate material selector UI (if present) and wire changes
    (function setupMaterialSelector(){
        const sel = document.getElementById('material-select');
        if(!sel) return;
        if(typeof materials === 'undefined') return;
        const keys = Object.keys(materials);
        keys.forEach(k => { const opt = document.createElement('option'); opt.value = k; opt.textContent = k; sel.appendChild(opt); });
        const found = keys.find(k => k.toLowerCase() === String(currentMaterial).toLowerCase());
        sel.value = found || currentMaterial;
        sel.addEventListener('change', (e) => { currentMaterial = e.target.value; applyMaterial(currentMaterial); });
    })();

    // initialize Scene module and start
    if(typeof window.Scene === 'undefined'){
        console.warn('Scene module not loaded; ensure scene.js is included before main.js');
        return;
    }

    window.Scene.init({
        gl,
        shaderProgram,
        attribs: { aPositionLocation, aColorLocation, aNormalLocation },
        uniforms: { uModelLocation, uViewLocation, uProjectionLocation, uNormalMatrixLocation, uLightPosLocation, uIllumModelLocation, uKaLocation, uKdLocation, uKsLocation, uShininessLocation, uAmbientLocation, uViewPosLocation },
        viewMatrix,
        projectionMatrix
    });

    // build and start
    window.Scene.buildSceneForShape('cube');
    window.Scene.start();
    // compatibility helper for UI buttons or older code that expects a global starter
    window.start3DScene = function(){
        if(typeof window.Scene === 'undefined') return console.warn('start3DScene: Scene missing');
        window.Scene.buildSceneForShape('cube');
        window.Scene.start();
    };
}
