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

class AIInput {
    /**
     * @param {Map<number, number[]>} remaining_values 
     * @param {Board} board_copy 
     */
    constructor (remaining_values, board_copy) {
        /**
         * Remaining values (signed/oriented)
         * @type {Map<number, number[]>}
         */
        this.remaining_values = remaining_values;

        /**
         * Copy of the current board
         * @type {Board}
         */
        this.board = board_copy;
    }
}

class AI {
    static MAX_DEPTH = 5;
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
     * @param {number?} max_depth 
     * @returns {Move}
     */
    getBestMoveBlack (max_depth = AI.MAX_DEPTH) {
        let best_move = null;
        const {remaining_values, board} = this.prepareInput ();
        const dim = board.dim;

        const used_set = new Set();
        let max_score = -Infinity;
        const values = remaining_values.get (Piece.BLACK);
        console.log( values )

        for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    const v_id = getIdValue (value, i);
                    
                    // 0 if empty
                    const existing_value = board.get (x, y);
                    const opposed_side = existing_value * value < 0;
                    const is_stronger = Math.abs(value) > Math.abs(existing_value);

                    // can we replace this case ?
                    if (existing_value === Piece.EMPTY || (opposed_side && is_stronger)) {
                        used_set.add (v_id);
                        board.set (x, y, value);

                        const score = this.minimax (false, board, remaining_values, used_set, 0, AI.MAX_DEPTH);
                        if (score > max_score) {
                            max_score = score;
                            best_move = new Move (x, y, value);
                        }

                        // undo
                        // if (opposed_side && is_stronger) {
                        //     board.set (x, y, existing_value);
                        // } else { // empty
                        //     board.empty (x, y);
                        // }
                        // existing_value can take 0 too
                        board.set (x, y, existing_value);
                        used_set.delete (v_id);
                    }
                }
            }
        }

        return best_move;
    }


    /**
     * @param {boolean} maximizing 
     * @param {Board} board 
     * @param {Map<number, number[]>} remaining_values 
     * @param {Set<string>} used_set 
     * @param {number} current_depth 
     * @param {number} max_depth 
     * @returns 
     */
    minimax (maximizing, board, remaining_values, used_set, current_depth, max_depth) {
        // console.log(current_depth);
        const winner = board.getWinner ();
        if (winner != null || current_depth >= max_depth) {
            const static_score = AI.MAX_DEPTH - current_depth + 1;
            if (winner == Piece.BLACK)
                return +static_score;
            console.log('Depth ', current_depth, ' score', static_score);
            return -static_score;
        }

        let score = maximizing ? -Infinity : +Infinity;
        const values = remaining_values.get (maximizing ? Piece.BLACK : Piece.WHITE);
        const dim = board.dim;

        for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    const v_id = getIdValue (value, i);

                    // piece already used
                    if (used_set.has (v_id))
                        continue;
                    
                    // 0 if empty
                    const existing_value = board.get (x, y);
                    const opposed_side = existing_value * value < 0;
                    const is_stronger = Math.abs(value) > Math.abs(existing_value);

                    // can we replace this case ?
                    if (existing_value === Piece.EMPTY || (opposed_side && is_stronger)) {
                        used_set.add (v_id);
                        board.set (x, y, value);

                        const computed = this.minimax (!maximizing, board, remaining_values, used_set, current_depth + 1, max_depth);
                        if (maximizing)
                            score = Math.max (score, computed);
                        else
                            score = Math.min (score, computed);

                        // existing_value can take 0 too
                        board.set (x, y, existing_value);
                        used_set.delete (v_id);
                    }
                }
            }
        }

        return score;
    }
    
    /**
     * Prepare input for the minimax
     * @returns 
     */
    prepareInput () {
        const board_copy = this.game.board.copy ();
        const remaining_values = new Map();
        remaining_values.set (Piece.BLACK, this.game.findUnusedPiece (Piece.BLACK).map (_ => _.oriented_strength));
        remaining_values.set (Piece.WHITE, this.game.findUnusedPiece (Piece.WHITE).map (_ => _.oriented_strength));

        return new AIInput (remaining_values, board_copy);  
    }
}