/**
 * TicTacToe MinMax javascript implementation
 * @author afmika
 */

function Game( dim ) {
	this.dim = dim || 3;
	this.map = {};
	this.map[  1] = 'X';
	this.map[ -1] = 'O';
	this.map[  0] = '.';
	this.map[0.5] = '.';

	this.board = new Array(this.dim);
	for (let i = 0; i < this.dim; i++) {
		this.board[i] = new Array(this.dim).fill(0);
	}

	/**
	 * @param {number} r
	 * @param {number} c
	 * @param {number} type_value
	 */
	this.set = function(r, c, type_value) {
		this.board[r][c] = type_value;
	}
	/**
	 * @param {number} r
	 * @param {number} c
	 * @param {number} type_value
	 */
	this.remove = function(r, c) {
		this.board[r][c] = 0;
	}

	/**
	 * @param {number} r
	 * @param {number} c
	 * @param {number} type_value
	 * @returns {boolean}
	 */
	this.put = function(r, c, type_value) {
		if ( this.board[r][c] == 0 ) {
			this.set(r, c, type_value);
			return true;
		}
		return false;
	}

	/**
	 * @param {number} r
	 * @param {number} c
	 * @param {number} type_value
	 * @returns {boolean}
	 */
	this.putRandomly = function(type_value) {
		let contains_empty_case = false;
		for (let y = 0; y < this.dim; y++) {
			for (let x = 0; x < this.dim; x++) {
				if ( this.board[y][x] == 0 ) {
					contains_empty_case = true;
					break;
				}
			}
			if ( contains_empty_case ) break;
		}

		let y = Math.random() * this.dim,
			x = Math.random() * this.dim;
		[y, x] = [y, x].map(t => Math.floor(t));
		
		if ( this.put(y, x, type_value) ) {
			return true;
		}

		// fail
		if ( contains_empty_case ) {
			return this.putRandomly( type_value );
		}
		return false;
	}

	/**
	 * @returns {number} the winner (-1, 1 or 0) returns null otherwise
	 */
	this.end = function() {
		let m = this.board;
		let s_diag_left = 0, s_diag_right = 0;
		let winner = 0;
		let empty_case = 0;
		for (let i = 0; i < this.dim; i++) {
			let s_horz = 0, s_vert = 0;
			for (let j = 0; j < this.dim; j++ ) {
				empty_case += m[i][j] == 0 ? 1 : 0;
				s_horz += m[i][j];
				s_vert += m[j][i];
			}
			s_diag_left  += m[i][i];
			s_diag_right += m[i][this.dim - i - 1];
			let values = [s_horz, s_vert, s_diag_right, s_diag_left];
			values.forEach( value => {
				if ( Math.abs(value) == this.dim ) {
					winner = value / this.dim;
				}
			});
			if ( winner != 0 ) {
				return winner;
			}
		}
		return empty_case > 0 ? null : 0;
	}

	this.isFull = function() {
		for (let i = 0; i < this.dim; i++) {
			for (let j = 0; j < this.dim; j++ ) {
				if ( this.board[i][j] == 0 ) {
					return false;
				}
			}
		}
		return true;
	}

	this.display = function() {
		for (let i = 0; i < this.dim; i++) {
			let str = '';
			for (let j = 0; j < this.dim; j++ ) {
				str += `${this.map[ this.board[i][j] ]} `;
			}
			console.log(str);
		}
	}
}

const AI = {};
AI.getBestMove = function (game, player, maxDepth) {
	let bestMove = { x : 0, y : 0};
	let currentScore = -Infinity;
	for (let y = 0; y < game.dim; y++) {
		for (let x = 0; x < game.dim; x++) {
			if ( game.board[y][x] == 0 ) {
				game.put(y, x, player);
				let score = AI.minmax(game, 0, maxDepth, false); // min
				game.remove(y, x);
				if ( score > currentScore ) { // max (root)
					// console.log(score);
					bestMove = {x : x, y : y};
					currentScore = score;
				}
			}
		}
	}
	return bestMove;
}

AI.minmax = function (game, depth_count, maxDepth, isMax) {
	const computer = 1; // the maximizer should be always > 0
	const human = -computer;
	const game_state = game.end();
	if ( game_state != null || depth_count >= maxDepth ) {
		let score = 1000 - depth_count;
		return game_state * score;
	}

	let best = isMax ? -Infinity : Infinity;
	for (let y = 0; y < game.dim; y++) {
		for (let x = 0; x < game.dim; x++) {
			if ( game.board[y][x] == 0 ) {
				if ( isMax ) {
					game.put(y, x, computer);
					best = Math.max(best, AI.minmax(game, depth_count + 1, maxDepth, false));
				} else {
					game.put(y, x, human);
					best = Math.min(best, AI.minmax(game, depth_count + 1, maxDepth, true));
				}
				game.remove(y, x);
			}
		}
	}
	return best;
}
