class Game {
    /**
     * @type {Board}
     */
    board;

    /**
     * @type {number}
     */
    dim;

    /**
     * side (1 or -1) => number[]
     * @type {Map<number, Piece[]>}
     */
    pieces_remaining;

    /**
     * Total pieces for each side
     * @type {number}
     */
    total_pieces = 0;

    /**
     * @type {number}
     */
    max_strength = 0;

    /**
     * List of played moves as string
     * * Format x=\d+ y=\d+ strength=\d+
     * @type {string[]}
     */
    replay = [];

    /**
     * @type {string[][]}
     */
    static all_replays = [];

    /**
     * @param {number} dim 
     */
    constructor (dim) {
        this.init (dim);
    }

    /**
     * @param {number} dim 
     */
    init (dim) {
        this.dim = dim || 3;

        if (this.replay.length > 0)
            Game.all_replays.push (this.replay);
        this.replay = [];

        this.board = new Board (this.dim);
        this.pieces_remaining = new Map();

        const {WHITE, BLACK} = Piece;
        this.pieces_remaining.set (WHITE, []);
        this.pieces_remaining.set (BLACK, []);

        const strengths = [1, 1, 1, 2, 2, 2, 3, 3, 3];
        this.max_strength = Math.max (...strengths);
        this.total_pieces = strengths.length;

        for (let strength of strengths) {
            this.pieces_remaining
                .get (WHITE)
                .push (new Piece (WHITE, strength));
            this.pieces_remaining
                .get (BLACK)
                .push (new Piece (BLACK, strength));
        }
    }

    /**
     * @param {number} bx 
     * @param {number} by 
     * @returns {Piece | null}
     */
    findPieceByBoardPosition (bx, by) {
        const sides = this.pieces_remaining.keys();
        
        for (let side of sides) {
            const pieces = this.pieces_remaining.get (side);
            for (let piece of pieces) {
                const {x, y} = piece._board;
                if (x == bx && y == by)
                    return piece;
            }
        }

        return null;
    }


    /**
     * @param {number?} owner 1 or -1
     * @returns {Piece[]} 
     */
    findUnusedPiece (owner = null) {
        const unused = [];
        const sides = this.pieces_remaining.keys();
        
        for (let side of sides) {
            const pieces = this.pieces_remaining.get (side);
            for (let piece of pieces) {
                if (!piece.isUsed()) {
                    if (owner == null || owner == side)
                        unused.push (piece);
                }
            }
        }

        return unused;
    }


    /**
     * @param {Move} move 
     */
    playMove (move) {
        const {x, y, strength} = move;
        // find the piece and 'use' it
        const black_side = strength * Piece.BLACK > 0;
        const pieces = this.findUnusedPiece (black_side ? Piece.BLACK : Piece.WHITE);
        for (let piece of pieces) {
            if (piece.oriented_strength == strength) {
                this.putPieceInBoard (x, y, piece);
                return true;
            }
        }
        return false;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {Piece} piece 
     */
    putPieceInBoard (x, y, piece) {
        // screen space
        piece._graphics.x = x * BLOC + BLOC / 2;
        piece._graphics.y = SIDE_HEIGHT + y * BLOC + BLOC / 2;
        piece.use (); // set _used = true

        // board space
        this.board.putPiece (x, y, piece);
        piece._board.x = x;
        piece._board.y = y;

        this.recordMove (x, y, piece.oriented_strength);
    }

    /**
     * @private
     * @param {number} x 
     * @param {number} y 
     * @param {number} strength 
     */
    recordMove (x, y, strength) {
        const str = `x=${x} y=${y} strength=${strength}`;
        this.replay.push (str);
    }
}