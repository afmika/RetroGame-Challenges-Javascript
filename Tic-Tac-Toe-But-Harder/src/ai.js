class Move {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} strength 
     */
    constructor (x, y, strength) {
        /**
         * x-coordinate in board space
         * @type {number}
         */
        this.x = x;

        /**
         * y-coordinate in board space
         * @type {number}
         */
        this.y = y;

        /**
         * Oriented strength
         * @type {number}
         */
        this.strength = strength;
    }
}

class AI {
    /**
     * @type {Game}
     */
    game;

    /**
     * @param {Game} game 
     */
    constructor (game) {
        this.init (game);
    }

    /**
     * @param {Game} game 
     */
    init (game) {
        this.game = game;
    }


    /**
     * @param {number} oriented_strength 
     * @param {number?} max_depth 
     * @returns {Move}
     */
    getBestMove (oriented_strength, max_depth = Infinity) {
        let best_move = null;
        const strength_map = this.prepareStrengthRawMap ();
        return best_move;
    }

    /**
     * @private
     */
    minimax () {

    }

    /**
     * @private
     */
    prepareStrengthRawMap () {
        const strength_map = new Map();
        strength_map.set (Piece.BLACK, this.game.findUnusedPiece (side).map (p => p.strength));
        strength_map.set (Piece.WHITE, this.game.findUnusedPiece (side).map (p => p.strength));
        return strength_map;
    }
}