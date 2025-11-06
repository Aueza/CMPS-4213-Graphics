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

// Topology list
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

function makeShape(faces, vertices, model, getNormals){
    let buffer = [],
        shape = {};
    
    faces.forEach(face => {
        face.forEach(index => {
            buffer.push(...vertices[index]);
        });
    });

    shape.model = model;
    shape.vertexBuffer = makeBuffer(gl, buffer);
    shape.nFaces = faces.length;

    return shape;
}

function drawTetrahedron(){
    // Geometry list
    let tetraVertices = [
        [ 1,  1,  1], // idx 0
        [-1, -1,  1], // idx 1
        [-1,  1, -1], // idx2
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
    // Golden ration constants
    const PHI = (1 + Math.sqrt(5)) / 2;
    const INV_PHI = 1 / PHI;

    // Geometry list
    let dodecaVertices = [
        [-1, -1, -1],
        [-1, -1,  1],
        [-1,  1, -1],
        [-1,  1,  1],
        [ 1, -1, -1],
        [ 1, -1,  1],
        [ 1,  1, -1],
        [ 1,  1,  1],

        [ 0, -INV_PHI, -PHI],
        [ 0, -INV_PHI,  PHI],
        [ 0,  INV_PHI, -PHI],
        [ 0,  INV_PHI,  PHI],

        [-INV_PHI, -PHI, 0],
        [-INV_PHI,  PHI, 0],
        [ INV_PHI, -PHI, 0],
        [ INV_PHI,  PHI, 0],

        [-PHI, -INV_PHI, 0],
        [-PHI,  INV_PHI, 0],
        [ PHI, -INV_PHI, 0],
        [ PHI,  INV_PHI, 0],
    ];

    // Topology list
    let dodecaFaces = [
        [ 1,  3, 11], [ 1, 11,  9], [ 1,  9,  5], 
        [ 3,  1, 17], [ 3, 17, 13], [ 3, 13,  2], 
        [ 7,  5,  9], [ 7,  9, 11], [ 7, 11, 15], 
        [ 7, 15, 19], [ 7, 19,  6], [ 7,  6,  4], 
        [ 0,  2, 13], [ 0, 13, 17], [ 0, 17, 16], 
        [ 0, 16, 12], [ 0, 12,  8], [ 0,  8,  4], 
        [ 5,  7,  4], [ 5,  4, 18], [ 5, 18, 14],
        [ 1,  5, 14], [ 1, 14, 12], [ 1, 12, 16], 
        [ 3,  2, 10], [ 3, 10, 11], [ 3, 11, 15], 
        [ 6, 19, 15], [ 6, 15, 10], [ 6, 10,  2], 
        [ 4,  8, 10], [ 4, 10,  6], [ 4,  6, 18], 
        [ 8, 12, 14], [ 8, 14, 18], [ 8, 18, 10]  
    ];

    return {
        geometry: dodecaVertices,
        topology: dodecaFaces
    };
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
        [ 0,  1, 10], [ 0, 10,  5], [ 0,  5,  4], [ 0,  4,  8], [ 0,  8,  1],
        [ 3,  2, 11], [ 3, 11,  7], [ 3,  7,  6], [ 3,  6,  9], [ 3,  9,  2],
        [ 1,  8,  6], [ 1,  6,  7], [ 1,  7, 10],
        [ 2,  9,  4], [ 2,  4,  5], [ 2,  5, 11],
        [ 8,  4,  9], [ 9,  6,  8],
        [ 5, 10, 11], [ 11,  7, 10]
    ];

    return {
        geometry: icosaVertices,
        topology: icosaFaces
    };
}

function drawSphere(){
    // Getting the base blueprint.
    let base = drawIcosahedron();
    let vertices = base.geometry;
    let faces = base.topology;

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
        let v1 = vertices[v1];
        let v2 = vertices[v2];

        // Calculate midpoint.
        let mid = [
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
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