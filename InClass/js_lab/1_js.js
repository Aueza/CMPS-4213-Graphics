console.log("welcome from main");


// --- Rectangle 1: Blue (dimmed) ---
const heroPositions = new Float32Array([
  -0.8, -0.2, 0.0,
  -0.2, -0.2, 0.0,
  -0.8,  0.4, 0.0,
  -0.2,  0.4, 0.0
]);

const heroColors = new Float32Array([
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0,
  0.0, 0.0, 1.0
]);

let hero = {
    name: "Zelda", 
    loc: [0.0, 0.0, 0.0], 
    action: false,
    pos: heroPositions,
    colors: heroColors,
    lf: 100
};


// --- Rectangle 2: Red (full intensity) ---
const zombiePositions = new Float32Array([
   0.2, -0.2, 0.0,
   0.8, -0.2, 0.0,
   0.2,  0.4, 0.0, 
   0.8,  0.4, 0.0
]);

const zombieColors = new Float32Array([
  1.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  1.0, 0.0, 0.0
]);

// make as a template and copy from it
let originalZombie = {
    name: "Z", 
    loc: [10.0, 10.0, 10.0],
    pos: zombiePositions,
    colors: zombieColors,

    lf: 100
};

let zombies = [];


// function calcDistance(heroLoc, zLoc) {
//     let dx = Math.abs(loc1[0] - loc2[0]);
//     let dy = Math.abs(loc1[1] - loc2[1]);
//     let dz = Math.abs(loc1[2] - loc2[2]);
//     dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
//     return dist;
// }

function calcDistance(loc1, loc2) {
    let dx = Math.abs(loc1[0] - loc2[0]);
    let dy = Math.abs(loc1[1] - loc2[1]);
    let dz = Math.abs(loc1[2] - loc2[2]);
    dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return dist;
}

function moreZombies(oz) {
    // let zombies = [];
    for (let i = 0; i < 10; i++) {
        zombies.push({
            name: oz.name,
            loc: [oz.loc[0] + i * 3, oz.loc[1], oz.loc[2]],
            lf: 100
        })
    }
    // return zombies;
}

function checkHits() {
    for (let i = 0; i < 10; i++) {
        let d  = calcDistance(hero.loc, zombies[i].loc);
        if (d <= 1.5 && hero.action) {
            // reduce the lf of the zombie

        } else if (d <= 1) {
            // reduce the lf of the hero
        }
    }
}


function action(event) {
    // make action true

    // check all zombies if anyone close and update life points

    // make action false
    
    // log hero lf


}

// these functions need to work when pressing the action btn
function moveLeft(event) {
    // update the hero movement in neg x direction
    // log hero position
}

function moveRight(event) {
    // update the hero movement in pos x direction
    // log hero position
}

function moveBackword(event) {
    // update the hero movement in neg z direction
    // log hero position
}

function moveForward(event) {
    // update the hero movement in pos z direction
    // log hero position
}

console.log(calcDistance(hero.loc, zombie.loc));