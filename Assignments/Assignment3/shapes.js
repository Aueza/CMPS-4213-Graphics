function drawCube(){
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    var indices = [
        1, 0, 3, 2,
        2, 3, 7, 6,
        3, 0, 4, 7,
        6, 5, 1, 2,
        4, 5, 6, 7,
        5, 4, 0, 1
    ];

    var cubeVertices = [];
    var cubeColors = [];

    for (var i = 0; i < indices.length; ++i){
        cubeVertices.push(vertices[indices[i]]);
        cubeColors.push(vertexColors[indices[i]]);
    }

    return {
        vertices: cubeVertices,
        colors: cubeColors
    };
}

function drawTetrahedron(){
    var vertices = [
        vec4( 0.0,  0.0,  1.0, 1.0),
        vec4( 0.0,  0.942809, -0.333333, 1.0),
        vec4( -0.816497, -0.471405, -0.333333, 1.0),
        vec4( 0.816497, -0.471405, -0.333333, 1.0)
    ];

    var vertexColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 1.0, 0.0, 1.0)   // yellow
    ];

    var indices = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 1,
        1, 3, 2
    ];

    var tetraVertices = [];
    var tetraColors = [];

    for(var i = 0; i < indices.length; ++i){
        tetraVertices.push(vertices[indices[i]]);
        tetraColors.push(vertexColors[indices[i]]);
    }

    return{
        vertices: tetraVertices,
        colors: tetraColors
    };
}



export{drawCube, drawTetrahedron};
