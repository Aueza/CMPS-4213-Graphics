console.log("Hello");
let graphicsPositions = [];
let graphicsColors = [];

let hero = {
    lifePoints: 100,
    name: "Ethan",
    action: false,
    level: 22,
    pos: [0.0, 0.0, 0.0],
    color: [1.0, 0.0, 0.0]
}

let zommbie = {
    name: "Zombie",
    lifePoints: 50,
    pos: [0.1, 0.0, 0.0],
    color: [0.0, 1.0, 0.0]
}

let zombies = [];


function init(){
    for(let i = 0; i < 10; i++) {
    zombies.push(
        {
            name: zombie.name,
            lifePoints: zombie.lifePoints,
            color: [...zombie.color],
            pos: [...zombie.pos]

        }
    );
}
}

init();

function check(heroLoc, zLoc){
    if (heroLoc[0] == zLoc[0] && heroLoc[1] == zLoc[1] && heroLoc[2] == zLoc[2]){
        console.log("Hero at same location as zombie");
        return true;
    }
    return false;
}

function mvLeft(event){
    hero.pos[0] -= 0.1;
    for (let i = 0; i < zombies.length; i++){
        if(check(hero.pos, zombies[i].pos)){
            if(hero.action == true){
                zombies[i].lifePoints -= 10;
            }
            else{
                hero.lifePoints -= 10;
            }
        }
    }

    console.log("Hero position: " + hero.pos);
    aggregatePositionAndColors();
}

function aggregatePositionAndColors(){
    graphicsPositions = [];
    graphicsColors = [];

    graphicsPositions.push(...hero.pos);
    graphicsColors.push(...hero.color);

    for(let i = 0; i < zombies.length; i++){
        graphicsPositions.push(...zombies[i].pos);
        graphhicsColors.push(...zombies[i].color);
    }
    console.log(graphicsPositions);
    console.log(graphicsColors);
}

let btnMoveLeft = document.getElementById("btnMoveLeft");
console.log(btnMoveLeft);
btnMoveLeft.addEventListener("click", mvLeft);