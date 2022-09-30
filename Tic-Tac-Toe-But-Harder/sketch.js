/**
 * @type {Game}
 */
let game = null;

/**
 * @type {Piece}
 */
let locked_piece = null, 
    locked_piece_attr = null;

let show_menu = true;
let winner = null;
let default_text = 'Press space to start';

// game init
function setup () {
    createCanvas (GAME_SIZE, GAME_SIZE + 2 * SIDE_HEIGHT);
    start ();
}

function start () {
    game = new Game (N_ROW);
    preparePiecesPositions ();
    winner = null;
    locked_piece = null;
    locked_piece_attr = null;
    show_menu = true;
}

// game loop
function draw () {
    background (255);
    drawCross ();
    drawPiecesOnEachSide ();

    winner = game.board.getWinner();
    let winner_text = '';
    if (winner != null) {
        const _text = {};
        _text[Piece.BLACK] = 'Black wins';
        _text[Piece.WHITE] = 'White wins';
        _text[0] = 'Draw';
        winner_text = _text [winner];
        show_menu = true;
    }

    if (show_menu) {
        drawTextCentered (winner == null ? default_text : winner_text);
    }
}

// event handlers
function keyPressed () {
    if (winner != null)
        start();
    if (keyCode == BACKSPACE || keyCode == ESCAPE || keyCode == 32)
        show_menu = false;
}

function mousePressed () {
    if (show_menu) return;
    if (mouseY < SIDE_HEIGHT || mouseY > (GAME_SIZE + SIDE_HEIGHT)) {
        // click a piece
        locked_piece = getPieceClickedGiven (mouseX, mouseY);
        if (locked_piece) // now clone the state
            locked_piece_attr = {...locked_piece._graphics};
    }
}

function mouseReleased () {
    if (show_menu) return;
    if (locked_piece != null) {
        // check if it's an empty case
        const [x, y] = getGameCoordinates (mouseX, mouseY);
        try {
            // get(x, y) throws an error if invalid
            const value = game.board.get (x, y);
            const existing_piece = game.findPieceByBoardPosition (x, y);
            const is_stronger = locked_piece.strongerThan (existing_piece);

            if (value == Piece.EMPTY || is_stronger) {
                if (is_stronger)
                    existing_piece.kill();

                // canvas space
                locked_piece._graphics.x = x * BLOC + BLOC / 2;
                locked_piece._graphics.y = SIDE_HEIGHT + y * BLOC + BLOC / 2;
                locked_piece.use (); // set _used = true

                // board space
                game.board.putPiece (x, y, locked_piece);
                locked_piece._board.x = x;
                locked_piece._board.y = y;
            } else
                throw Error ('Not empty');
            
            game.board.print ();
        } catch (err) {
            // restore
            console.log (err.message);
            locked_piece._graphics = {...locked_piece_attr};
        }
    }
    locked_piece = null;
    locked_piece_attr = null;
}

function mouseDragged () {
    if (show_menu) return;
    if (locked_piece != null) {
        locked_piece._graphics.x = mouseX;
        locked_piece._graphics.y = mouseY;
    }
}

// utils
function drawCross () {
    stroke (0);
    fill (255);
    for (let i = 0; i < (N_ROW * N_ROW); i++)
        rect ((i % N_ROW) * BLOC, SIDE_HEIGHT + Math.floor(i / N_ROW) * BLOC, BLOC, BLOC, BLOC_CORNER);
    noFill ();
    noStroke ();
}

function drawTextCentered (str) {
    // erase background
    fill (255);
    rect (0, SIDE_HEIGHT / 1.8 + GAME_SIZE / 2, GAME_SIZE, GAME_SIZE / 4, BLOC_CORNER);
    noFill ();

    fill (50);
    textSize (32);
    textAlign(CENTER, CENTER);
    text (str, GAME_SIZE / 2, SIDE_HEIGHT + GAME_SIZE / 2);
    noFill ();
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
            if (piece.isKilled())
                continue;
            const {x, y, diameter} = piece._graphics;
            fill (piece.owner < 0 ? 0 : 255);
            stroke (piece.owner < 0 ? 255 : 0);
            circle (x, y, diameter);
            noStroke ();
            noFill ();
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