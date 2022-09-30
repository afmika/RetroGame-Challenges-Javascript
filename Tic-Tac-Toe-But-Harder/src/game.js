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
     * @param {number} dim 
     */
    constructor (dim) {
        this.dim = dim;
        this.init ();
    }

    init () {
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
}