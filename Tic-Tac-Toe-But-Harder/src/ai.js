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


class Statistics {
    /**
     * @type {number}
     */
    depth_level = 0;

    /**
     * @type {number}
     */
    last_call_count = 0;
    
    /**
     * @type {number}
     */
    total_call_count = 0;
    
    /**
     * @type {number[]}
     */
    history = [];
}


class AI {
    /**
     * Default depth
     * @type {number}
     */
    static MAX_DEPTH = 8;

    /**
    * @type {Statistics[]}
    */
    static statistics_history = [];
    
    /**
     * AI call stats
     * @type {Statistics}
     */
    statistics = new Statistics ();

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
     * Useful when the AI starts first
     * @returns {Move}
     */
    getRandomMove () {
        const {remaining_values, board} = this.prepareInput ();
        const dim = board.dim;
        const values = remaining_values.get (Piece.BLACK);

        let possibilites = [];
        for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
                const existing_piece = board.get (x, y);
                if (existing_piece === Piece.EMPTY)
                    possibilites.push ([x, y]);
            }
        }

        if (possibilites.length == 0)
            throw Error ('Unable to find a random a move, empty_count = 0');

        const rng = x => Math.floor (x * Math.random ());
        const [rx, ry] = possibilites [rng (possibilites.length)];
        const rvalue = values [rng (values.length)];

        return new Move (rx, ry, rvalue);
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

                        const score = this.minimax (-Infinity, +Infinity, false, board, remaining_values, used_set, 1, max_depth);
                        if (score > max_score) {
                            max_score = score;
                            best_move = new Move (x, y, value);
                        }

                        // undo
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
     * @param {number} alpha 
     * @param {number} beta
     * @param {boolean} maximizing 
     * @param {Board} board 
     * @param {Map<number, number[]>} remaining_values 
     * @param {Set<string>} used_set 
     * @param {number} current_depth 
     * @param {number} max_depth 
     * @returns 
     */
    minimax (alpha, beta, maximizing, board, remaining_values, used_set, current_depth, max_depth) {
        const winner = board.getWinner ();
        if (winner != null || current_depth >= max_depth) {
            const static_score = AI.MAX_DEPTH - current_depth + 1;
            if (winner == Piece.BLACK)
                return +static_score;
            // this.logInfos ('Depth ', current_depth, ' score', static_score);
            return -static_score;
        }

        this.statistics.depth_level = max_depth;
        this.statistics.last_call_count++;
        this.statistics.total_call_count++;

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

                        const computed = this.minimax (alpha, beta, !maximizing, board, remaining_values, used_set, current_depth + 1, max_depth);
                        if (maximizing) {
                            score = Math.max (score, computed);
                            alpha = Math.max (alpha, score);
                        } else {
                            score = Math.min (score, computed);
                            beta = Math.min (beta, score);
                        }

                        // undo
                        // existing_value can take 0 too
                        board.set (x, y, existing_value);
                        used_set.delete (v_id);

                        // prune next branch
                        if (beta <= alpha)
                            break;
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
        const fetchUnused = type => {
            // /!\ Pruning heurestic for alpha-beta
            // low value moves are more likely to prioritize low-strength pieces
            // hence we sort in ascending order
            return this.game
                    .findUnusedPiece (type)
                    .map (piece => piece.oriented_strength)
                    .sort ((a, b) => a - b);
        };
        remaining_values.set (Piece.BLACK, fetchUnused (Piece.BLACK));
        remaining_values.set (Piece.WHITE, fetchUnused (Piece.WHITE));

        return new AIInput (remaining_values, board_copy);  
    }

    /**
     * @param  {...string} str 
     */
    logInfos (...str) {
        const text = str.join(' ');
        console.log (text);
    }

    /**
     * Save and reset `last_call_count`
     */
    saveStatLastCallCount () {
        this.statistics.history.push (this.statistics.last_call_count);
        this.statistics.last_call_count = 0;
    }

    /**
     * Save then reset statistics
     */
    saveAndResetStatistics () {
        // save
        AI.statistics_history.push (this.statistics);
        // reset
        this.statistics = new Statistics ();
    }

    /**
     * Log latest data from `statistics_history`
     */
    logStats () {
        if (AI.statistics_history.length == 0) {
            console.log ('=== No data ===');
            return;
        }
        const n_instances = AI.statistics_history.length;

        const statistics = AI.statistics_history [n_instances - 1];
        const round = x => Math.round (x * 100) / 100;
        const avg = n_instances == 0 ? 0 : AI.statistics_history
                                            .map (stat => stat.total_call_count)
                                            .reduce ((acc, x) => acc + x) / n_instances;
        
        console.log (
            'AI Minimax stats :', 
            'Total call ' + statistics.total_call_count, 
            'Last call ' + statistics.last_call_count,
            'Max depth ' + statistics.depth_level
        );

        console.log (
            'History :\n', 
            statistics
                .history
                .map ((v, i) => `#${i+1} move => ${v} calls`)
                .join('\n ')
        );

        console.log (
            'Average total :', 
            round (avg) + ' calls ', 
            '(' + n_instances + ' game(s))'
        );
    }
}