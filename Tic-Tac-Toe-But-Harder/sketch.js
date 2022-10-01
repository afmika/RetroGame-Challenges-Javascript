/**
 * @type {Game}
 */
let game = null;

/**
 * @type {AI}
 */
let computer = null;

/**
 * @type {Piece}
 */
let locked_piece = null, 
    locked_piece_attr = null;
let lock_score = false;

let show_menu = true;
let show_loading = false;
let winner = null;
let default_text = 'Press escape to start';

let white_turn = true;

let max_depth = 4;
let cooldown = {max_time : 100, counter : 0};
let game_stat = {black : 0, white : 0};
let game_end = false;
let game_has_no_pieces = true;

// game init
function setup () {
    createCanvas (GAME_SIZE, GAME_SIZE + 2 * SIDE_HEIGHT);
    start ();
}

function start () {
    game = new Game (N_ROW);
    computer = new AI (game);
    preparePiecesPositions ();
    winner = null;
    locked_piece = null;
    locked_piece_attr = null;
    show_menu = true;
    show_loading = false;
    lock_score = false;
    game_end = false;
    game_has_no_pieces = true;
}

// game loop
function draw () {
    background (255);
    drawCross ();
    drawPiecesOnEachSide ();

    winner = game.board.getWinner();
    let winner_text = '';
    if (winner != null) {
        if (!lock_score) {
            game_stat[winner == Piece.BLACK ? 'black' : 'white']++;
            lock_score = true;
        }
        const stat_text = game_stat.white + ' : ' + game_stat.black;

        const _text = {};
        _text[Piece.BLACK] = 'Black wins - ' + stat_text;
        _text[Piece.WHITE] = 'White wins - ' + stat_text;
        _text[0] = 'Draw - ' + stat_text;
        winner_text = _text [winner];
        show_menu = true;
        game_end = true;
    }

    if (show_menu) {
        showLog ();
        writeLog (winner == null ? default_text : winner_text, true);
    }

    if (!white_turn && !game_end) {
        drawTextLoading ('Thinking ...');
        if (cooldown.counter >= cooldown.max_time) {
            let c_move = null;
            if (game_has_no_pieces) { // AI starts first
                console.log ('Random move picked');
                c_move = computer.getRandomMove ();
            } else
                c_move = computer.getBestMoveBlack (max_depth);
            
            game.playMove (c_move);
            white_turn = !white_turn;
            game_has_no_pieces = false;
            cooldown.counter = 0;
        } else {
            // give some time to the renderer to actually render any new position
            cooldown.counter++;
        }
    }
}

// event handlers
function keyPressed () {
    if (winner != null)
        start();
    if (keyCode == BACKSPACE || keyCode == ESCAPE || keyCode == 32) {
        show_menu = false;
        hideLog ();
    }
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

            const valid_state = (locked_piece.owner === Piece.WHITE &&  white_turn) 
                            ||  (locked_piece.owner === Piece.BLACK && !white_turn);
            if (!valid_state)
                throw Error ('Illegal move');

            // get(x, y) throws an error if invalid
            const value = game.board.get (x, y);
            const existing_piece = game.findPieceByBoardPosition (x, y);
            const is_stronger = locked_piece.strongerThan (existing_piece);

            if (value == Piece.EMPTY || is_stronger) {
                if (is_stronger)
                    existing_piece.kill();
                game.putPieceInBoard (x, y, locked_piece);
                white_turn = !white_turn;
                game_has_no_pieces = false;
            } else
                throw Error ('Not empty');
            
            game.board.print ();
        } catch (err) {
            console.log (err.message);
            // restore
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

function drawTextLoading (str) {
    fill (50);
    textSize (16);
    textAlign(CENTER, CENTER);
    text (str, GAME_SIZE / 2, SIDE_HEIGHT + GAME_SIZE / 2);
    noFill ();
}

function preparePiecesPositions () {
    const sides = game.pieces_remaining.keys();
    const max_diameter = Math.min (GAME_SIZE / game.total_pieces, SIDE_HEIGHT / 2);
    const max_strength = game.max_strength;
    
    for (let side of sides) {
        const pieces = game.pieces_remaining.get (side);
        const dy = side > 0 ? (GAME_SIZE + SIDE_HEIGHT) : 0;
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