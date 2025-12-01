// Scene.js will handle the shaders and rendering of 3D scenes.
// This main.js sets up shape blueprints and wires the UI buttons.
window.onload = function main(){
    // Blueprint functions
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
            [ 0,  1, 10], [ 0, 10,  5], [ 0,  5,  4], [ 0,  4,  8], [ 0,  8,  1],
            [ 3,  2, 11], [ 3, 11,  7], [ 3,  7,  6], [ 3,  6,  9], [ 3,  9,  2],
            [ 1,  8,  6], [ 1,  6,  7], [ 1,  7, 10],
            [ 2,  9,  4], [ 2,  4,  5], [ 2,  5, 11],
            [ 8,  4,  9], [ 9,  6,  8],
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
    // UV Sphere generation
    function drawUVSphere(segments = 32, rings = 24){
        // geometry and topology arrays
        const geometry = [];
        const topology = [];

        // vertices
        for (let r = 0; r <= rings; r++){
            const v = r / rings;
            const theta1 = v * Math.PI;

            // Create a ring of vertices at this latitude
            for (let s = 0; s <= segments; s++){
                const u = s / segments;
                const theta2 = u * 2 * Math.PI;

                // Spherical to Cartesian conversion
                const x = Math.sin(theta1) * Math.cos(theta2);
                const y = Math.cos(theta1);
                const z = Math.sin(theta1) * Math.sin(theta2);
                geometry.push([x, y, z]);
            }
        }

        // Build faces (topology)
        for (let r = 0; r < rings; r++){
            for (let s = 0; s < segments; s++){
                // Indices of the quad's corners
                const first = (r * (segments + 1)) + s;
                const second = first + 1;
                const third = first + (segments + 1);
                const fourth = third + 1;
                
                // Two triangles per quad
                topology.push([first, third, second]);
                topology.push([second, third, fourth]);
            }
        }
        
        return { geometry, topology };
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
    

    // exposing blueprints for final scene.
    window.blueprints = {
        icosa: drawIcosahedron,
        sphere: drawSphere,
        uvSphere: drawUVSphere
    };
   
    // Scene setup helper: build scene for selected shape
    window.selectedShapeName = 'sphere';

    function q(id){ return document.getElementById(id); }

    // wire planet-scene button
    const planetBtn = q('render-planets');
    if(planetBtn){
        planetBtn.addEventListener('click', () => {
            if(typeof window.stopMainScene === 'function') window.stopMainScene();
            if(typeof window.startPlanetScene === 'function'){
                window.startPlanetScene();
            } else {
                console.warn('Planet scene starter not available yet.');
            }
        });
    }
    window.stopMainScene = window.stopMainScene || function(){};
};
