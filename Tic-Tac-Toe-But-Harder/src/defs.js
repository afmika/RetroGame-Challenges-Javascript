const GAME_SIZE = 512;
const SIDE_HEIGHT = 120;
const PIECE_OFFSET = {x : 10, y : 10};
const N_ROW = 3;
const BLOC = GAME_SIZE / N_ROW;
const BLOC_CORNER = BLOC / 6;

const assert = (hyp, msg) => {
    if (!hyp) throw Error (msg || 'Assertion failed');
}

const assertDefined = (value, msg) => {
    assert (value !== null && value !== undefined, msg || 'value undefined');
};

const assertValidSide = (state, msg) => {
    assert (state === Piece.BLACK || state === Piece.WHITE, msg || 'side should take value -1 or 1');
}

/**
 * @param {number} x 
 * @param {number} y 
 */
const getGameCoordinates = (x, y) => [Math.floor (x / BLOC), Math.floor ((y - SIDE_HEIGHT) / BLOC)];

class Piece {
    static EMPTY = 0;
    static BLACK = -1;
    static WHITE = 1;

    /**
     * In game attributes
     */
    _graphics = {
        /**
         * @type {number}
         */
        x : 0,

        /**
         * @type {number}
         */
        y : 0,
    
        /**
         * @type {number}
         */
        diameter : 0
    }

    /**
     * Board space position
     */
    _board = {
        /**
         * @type {number}
         */
        x : Infinity,

        /**
         * @type {number}
         */
        y : Infinity
    }

    /**
     * @type {string}
     */
    _id = null;

    /**
     * @type {boolean}
     */
    _killed = false;

    /**
     * @type {boolean}
     */
    _used = false;

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
        assertValidSide (this.owner);
    }

    /**
     * @param {Piece} piece 
     */
    strongerThan (piece) {
        if (!piece) return false;
        if (piece.oriented_strength * this.oriented_strength < 0)
            return Math.abs(this.oriented_strength) > Math.abs(piece.oriented_strength);
        return false; // same owner
    }

    kill () {
        this._killed = true;
    }

    use () {
        this._used = true;
    }

    isKilled () {
        return this._killed;
    }

    isUsed () {
        return this._used;
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
        this.assertValidPos (x, y);
        assertDefined (value);
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
                const ans = value / this.dim;
                assertValidSide (ans, 'expects -1 or 1');
                return ans;
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
