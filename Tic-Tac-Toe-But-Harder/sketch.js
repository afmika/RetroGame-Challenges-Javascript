const game = new Game (N_ROW);
let locked = null, 
    locked_piece_attr = null;

// game init
function setup () {
    createCanvas (GAME_SIZE, GAME_SIZE + 2 * SIDE_HEIGHT);
    preparePiecesPositions ();
}

// game loop
function draw () {
    background (200);
    drawCross ();
    drawPiecesOnEachSide ();
}

// event handlers
function mousePressed () {
    if (mouseY < SIDE_HEIGHT || mouseY > (GAME_SIZE + SIDE_HEIGHT)) {
        // click a piece
        locked = getPieceClickedGiven (mouseX, mouseY);
        if (locked) // now clone the state
            locked_piece_attr = {...locked._graphics};
    } else {
        // const [mx, my] = getGameCoordinates (mouseX, mouseY);
        // console.log (mx, my);
    }
}

function mouseReleased () {
    if (locked != null) {
        // check if it's an empty case
        const [x, y] = getGameCoordinates (mouseX, mouseY);
        try {
            // get(x, y) throws an error if it's invalid
            const value = game.board.get (x, y);
            if (value == Piece.EMPTY) {
                // canvas space
                locked._graphics.x = x * BLOC + BLOC / 2;
                locked._graphics.y = SIDE_HEIGHT + y * BLOC + BLOC / 2;

                // board space
                game.board.putPiece (x, y, locked);
            } else
                throw Error ('Not empty');
        } catch (err) {
            // restore
            console.log(err.message)
            locked._graphics = {...locked_piece_attr};
        }
    }
    locked = null;
    locked_piece_attr = null;
}

function mouseDragged () {
    if (locked != null) {
        locked._graphics.x = mouseX;
        locked._graphics.y = mouseY;
    }
}

// utils
function drawCross () {
    for (let i = 0; i < (N_ROW * N_ROW); i++) {
        rect ((i % N_ROW) * BLOC, SIDE_HEIGHT + Math.floor(i / N_ROW) * BLOC, BLOC, BLOC, BLOC_CORNER);
        stroke (0);
    }
}

function preparePiecesPositions () {
    const sides = game.pieces_remaining.keys();
    const max_diameter = GAME_SIZE / game.total_pieces;
    const max_strength = game.max_strength;
    
    for (let side of sides) {
        const pieces = game.pieces_remaining.get (side);
        const dy = 0 + (side > 0 ? (GAME_SIZE + SIDE_HEIGHT) : 0);
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            piece._graphics.x = max_diameter * (i  + .5);
            piece._graphics.y = max_diameter + dy; 
            piece._graphics.diameter = max_diameter * (piece.strength / max_strength);
            // define the id
            piece._id = (side < 0 ? 'b' : 'w') + i;
        }
    }
}

function drawPiecesOnEachSide () {
    const sides = game.pieces_remaining.keys();
    for (let side of sides) {
        const pieces = game.pieces_remaining.get (side);
        for (let piece of pieces) {
            const {x, y, diameter} = piece._graphics;
            circle (x, y, diameter);
            stroke (0);
        }
    }
}

function getPieceClickedGiven (mX, mY) {
    const sides = game.pieces_remaining.keys();
    for (let side of sides) {
        const pieces = game.pieces_remaining.get (side);
        for (let piece of pieces) {
            const {x, y, diameter} = piece._graphics;

            const dr = (x - mX) ** 2 + (y - mY) ** 2; 
            const r2 =  (diameter / 2) ** 2;
            if (dr <= r2)
                return piece;
            
        }
    }
    return null;
} 