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

        /**
         * @type {string}
         */
        this.v_id = '<any>';
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
    last_call_prune_count = 0;
    
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

        let possibilities = [];
        for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
                const existing_piece = board.get (x, y);
                if (existing_piece === Piece.EMPTY)
                possibilities.push ([x, y]);
            }
        }

        if (possibilities.length == 0)
            throw Error ('Unable to find a random move, empty_count = 0');

        const rng = x => Math.floor (x * Math.random ());
        const [rx, ry] = possibilities [rng (possibilities.length)];
        const rvalue = values [rng (values.length)];

        return new Move (rx, ry, rvalue);
    }

    //
    // Core AI
    //

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

        const moves = AI.generateMoves (board, Piece.BLACK, remaining_values, used_set);

        for (let move of moves) {
            const {x, y, strength, v_id} = move;
            const value = strength;
            const existing_value = board.get (x, y);
            
            used_set.add (v_id);
            board.set (x, y, value);

            const score = this.minimax (-Infinity, +Infinity, false, board, remaining_values, used_set, 1, max_depth);
            if (score > max_score) {
                max_score = score;
                best_move = move;
            }

            // undo
            // existing_value can take 0 too
            board.set (x, y, existing_value);
            used_set.delete (v_id);
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
            let static_score = AI.MAX_DEPTH - current_depth;
            // game not ended yet
            // should have less points
            if (winner === null)
                return (maximizing ? +1 : -1) * (static_score - 1);
            // game ended, we have a winner
            return winner === Piece.BLACK ? +static_score : -static_score;
        }

        this.statistics.depth_level = max_depth;
        this.statistics.last_call_count++;
        this.statistics.total_call_count++;

        let score = maximizing ? -Infinity : +Infinity;

        const side = maximizing ? Piece.BLACK : Piece.WHITE;
        const moves = AI.generateMoves (board, side, remaining_values, used_set);

        for (let move of moves) {
            const {x, y, strength, v_id} = move;
            const value = strength;
            const existing_value = board.get (x, y);

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
            if (beta <= alpha) {
                this.statistics.last_call_prune_count++;
                break;
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
            return this.game
                    .findUnusedPiece (type)
                    .map (piece => piece.oriented_strength);
        };
        remaining_values.set (Piece.BLACK, fetchUnused (Piece.BLACK));
        remaining_values.set (Piece.WHITE, fetchUnused (Piece.WHITE));

        return new AIInput (remaining_values, board_copy);  
    }

    //
    // dealing with moves
    //

    /**
     * @param {Board} board
     * @param {number} side -1 or 1
     * @param {Map<number, number[]} remaining_values 
     * @param {Set<string>} used_set 
     * @returns {Move[]}
     */
    static generateMoves (board, side, remaining_values, used_set = new Set()) {
        const moves = [];
        const dim = board.dim;
        const values = remaining_values.get (side);
        for (let y = 0; y < dim; y++) {
            for (let x = 0; x < dim; x++) {
                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    const v_id = getIdValue (value, i);
                    if (used_set.has (v_id))
                        continue;
                    // 0 if empty
                    const existing_value = board.get (x, y);
                    const opposed_side = existing_value * value < 0;
                    const is_stronger = Math.abs(value) > Math.abs(existing_value);

                    // can we replace the existing piece / use this case ?
                    if (existing_value === Piece.EMPTY || (opposed_side && is_stronger)) {
                        const move = new Move (x, y, value);
                        move.v_id = v_id;
                        moves.push (move);
                    }
                }
            }
        }

        AI.rearrangeMovesUsingHeuristic (moves, true);
        return moves;
    }

    /**
     * @param {Move[]} moves 
     * @param {boolean} enable_cluster_randomize 
     */
    static rearrangeMovesUsingHeuristic (moves, enable_cluster_randomize = false) {
        // /!\ Pruning heuristic for alpha-beta
        // low value moves are more likely to prioritize low-strength pieces
        // hence we sort in descending order
        moves = moves.sort ((a, b) => {
            return Math.abs (b.strength) - Math.abs (a.strength);
        });
        
        if (!enable_cluster_randomize)
            return moves;
        
        // /!\
        // experiment

        // To avoid repeating patterns
        // for each strength type we might want to
        // randomize which move should be prioritized
        // Note : each type (cluster) has been sorted in ascending order at this point
        /** @type {Map<number, Move[]>} */
        const clusters = new Map ();
        for (let move of moves) {
            if (!clusters.has (move.strength))
                clusters.set (move.strength, []);
            clusters.get (move.strength)
                    .push (move);
        }

        const rngIndex = x => Math.floor (x * Math.random ());
        // Fisher-Yates shuffle
        const shuffleArray = (arr) => {
            let total_remaining = arr.length;
            for (let i = arr.length - 1; i > 0; i--) {
                const picked = rngIndex (total_remaining--);
                [arr[picked], arr[i]] = [arr[i], arr[picked]];
            }
        };
        
        const strength_types = Array.from (clusters.keys());
        const rearranged_moves = [];

        for (let type of strength_types) {
            const moves_of_this_type = clusters.get (type);
            shuffleArray (moves_of_this_type);
            for (let move of moves_of_this_type)
                rearranged_moves.push (move);
        }

        assert (rearranged_moves.length == moves.length, 'expects same length');

        return rearranged_moves;
    }


    // 
    // statistics
    //

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
        this.statistics.history.push ({
            call_count : this.statistics.last_call_count,
            pruned_count : this.statistics.last_call_prune_count
        });
        this.statistics.last_call_count = 0;
        this.statistics.last_call_prune_count = 0;
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
     * @param {number} side 1 or -1 (-1 by default) 
     */
    logPossibleMoves (side = Piece.BLACK) {
        const {remaining_values, } = this.prepareInput();
        const moves = AI.generateMoves(this.game.board, side, remaining_values);
        console.log (
            moves.length + ' moves :\n' 
            + moves
                .map (move => {
                    const {x, y, strength, v_id} = move;
                    return ` x = ${x}, y = ${y} | strength : ${strength} (v_id = ${v_id})`;
                })
                .join('\n')
        )
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
                .map ((move_stat, i) => {
                    const {call_count, pruned_count} = move_stat;
                    const at_least_total = pruned_count + call_count;
                    const ratio = round (100 * pruned_count / (at_least_total == 0 ? 1 : at_least_total));
                    return  `#${i+1} move => ${call_count} calls | pruned ${pruned_count} (>=${ratio} %)`
                })
                .join('\n ')
        );

        console.log (
            'Average total :', 
            round (avg) + ' calls ', 
            '(' + n_instances + ' game(s))'
        );
    }
}