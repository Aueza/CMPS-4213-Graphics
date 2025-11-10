var numPositions  = 36;

var positions = [];
var colors = [];
var normals = [];

function colorCube()
{
    quad(0, 1, 2, 3);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{

    var vertices = [
        [-0.5, -0.5,  -0.5, 1.0],
        [-0.5,  0.5,  -0.5, 1.0],
        [ 0.5,  0.5,  -0.5, 1.0],
        [ 0.5, -0.5,  -0.5, 1.0],
        [-0.5, -0.5,   0.5, 1.0],
        [-0.5,  0.5,   0.5, 1.0],
        [ 0.5,  0.5,   0.5, 1.0],
        [ 0.5, -0.5,   0.5, 1.0],
    ];

    var vertexColors = [
        [0.0, 0.0, 0.0, 1.0],  // black
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 1.0, 1.0, 1.0]   // white
    ];

    let ab = vec4.create();
    vec4.subtract(ab, vertices[b], vertices[a]);

    let bc = vec4.create();
    vec4.subtract(bc, vertices[c], vertices[b]);

    let crossResult = vec4.create();
    vec3.cross(crossResult, bc.slice(0,3), ab.slice(0,3));

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push(...vertices[indices[i]] );
        normals.push(...crossResult);

    }
}
