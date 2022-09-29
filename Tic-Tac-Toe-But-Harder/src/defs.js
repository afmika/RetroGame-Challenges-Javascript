const GAME_SIZE = 400;
const N_ROW = 3;
const BLOC = GAME_SIZE / N_ROW;

const assert = (hyp, msg) => {
    if (!hyp) throw Error (msg || 'Assertion failed');
}

const assertDefined = (value, msg) => {
    assert (value !== null && value !== undefined, msg || 'value undefined');
};

/**
 * @param {number} x 
 * @param {number} y 
 */
const getGameCoordinates = (x, y) => [Math.floor (x / BLOC), Math.floor (y / BLOC)];

class Piece {
    static EMPTY = 0;
    static BLACK = -1;
    static WHITE = 1;

    /**
     * @param {number} owner 
     * @param {number} strength 
     */
    constructor (owner, strength) {
        /**
         * @type {number} -1 or 1
         */
        this.owner = owner;

        /**
         * @type {number} positive number
         */
        this.strength = strength;

        /**
         * @type {number} corresponding oriented strength
         */
        this.oriented_strength = this.owner * this.strength;

        assertDefined (this.owner, 'owner is undefined');
        assertDefined (this.strength, 'strength is undefined');
        assert (this.strength > 0, 'strength must be > 0');
        assert (this.owner != Piece.BLACK || this.owner != Piece.WHITE, 'owner should take values -1 or 1');
    }
}


class Board {
    /**
     * @param {number} dim 
     */
    constructor (dim) {

        if (dim === undefined || dim === null) 
            throw Error ('dim should be defined');
        if (dim <= 0) 
            throw Error ('dim should be greater than 0');

        /**
         * @type {number}
         */
        this.dim = dim;

        /**
         * @type {number[]}
         */
        this.content = [];

        for (let i = 0; i < (dim * dim); i++)
            this.content.push(0);
        
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} value 
     */
    set (x, y, value) {
        this.assertValid (x, y);
        if (value === undefined || value === value)
            throw Error ('value should be defined');
        this.content[x + y * this.dim] = value; 
    }

    /**
     * Similar to `set(x, y, value)` but uses the piece's `oriented strength` as value
     * @param {number} x 
     * @param {number} y 
     * @param {Piece} piece 
     */
    putPiece (x, y, piece) {
        this.set (x, y, piece.oriented_strength);
    }

    /**
     * @param {number} x 
     * @param {number} y
     */
    empty (x, y) {
        this.assertValidPos (x, y);
        this.set (x, y, Piece.EMPTY);
    }

    /**
     * @param {number} x 
     * @param {number} y
     */
    get (x, y) {
        this.assertValidPos (x, y);
        return this.content[x + y * this.dim]; 
    }

    /**
     * Converts piece values to player state space -1, 0, 1
     * @param {number} x 
     * @param {number} y
     */
    getType (x, y) {
        // Example : -4, -1, 0, 5, ... => -1, -1, 0, 1, ...
        const oriented_strength = this.get (x, y);
        if (oriented_strength == 0)
            return 0;
        return oriented_strength < 0 ? Piece.BLACK : Piece.WHITE;
    }

    /**
     * @private
     * @param  {...number} coords 
     */
    assertValidPos (...coords) {
        for (let coord of coords) {
            assertDefined (coord);
            assert (
                coord >= 0 && coord < this.dim, 
                '0 <= coord < ' + this.dim + ' expected, got ' + coord
            );
        }
    }


    /**
     * Determine the winner : 1, -1, 0 (draw) or null (not ended yet)
     * @returns {number | null}
     */
    getWinner () {
        let s_diag_left = 0, s_diag_right = 0;
        let n_empty_case = 0;
        
        for (let i = 0; i < this.dim; i++) {
            let s_horz = 0, s_vert = 0;

            for (let j = 0; j < this.dim; j++) {
                n_empty_case += this.getType (i, j) == 0 ? 1 : 0; 
                s_horz += this.getType (i, j);
                s_vert += this.getType (j, i);
            }

            s_diag_left  += this.getType (i, i);
            s_diag_right += this.getType (i, this.dim - i - 1);

            let filtered_sum = [s_horz, s_vert, s_diag_right, s_diag_left]
                        .filter(value => Math.abs (value) == this.dim);

            if (filtered_sum.length > 0) {
                const [value] = filtered_sum;
                return value / this.dim;
            }
        }

        // no winner
        // if the grid is not full (n_empty_case > 0) : return null (game not finished yet)
        // otherwise return 0 (draw)
        return n_empty_case > 0 ? null : 0;
    }

    print () {
        let total = '';
        for (let i = 0; i < this.dim; i++) {
            let row = [];
            for (let j = 0; j < this.dim; j++)
                row.push (this.get(j, i));
            total += row.join(' ') + '\n';
        }
        console.log (total);
    }
}
