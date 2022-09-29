function setup () {
    createCanvas (GAME_SIZE, GAME_SIZE);
}
    
function draw () {
    background (200);

    // cross
    for (let i = 0; i < (N_ROW * N_ROW); i++) {
        rect ((i % N_ROW) * BLOC, Math.floor(i / N_ROW) * BLOC, BLOC, BLOC);
        stroke (0);
    }
}

function mouseClicked () {
    const [mx, my] = getGameCoordinates (mouseX, mouseY);
    console.log (mx, my);
}

function update () {
}