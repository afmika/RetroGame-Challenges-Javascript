class Board {
	/**
	 * @constructor
	 * Constructs a new game
	 */	
	constructor(n_col, n_row) {
		this.n_col = n_col;
		this.n_row = n_row;
		this.m = [];
		this.init();
	}


	/**
	 * Initiates a new board
	 */
	init () {
		this.m = new Array(this.n_row);
		for (let i = 0; i < this.n_row; i++ )
			this.m[i] = new Array(this.n_col).fill(0);
	}


	/**
	 * Adds a new brick inside the board and returns true if it can fit inside
	 * @params {Brick} brick
	 * @returns {boolean} 
	 */
	fits ( brick ) {
		let m = brick.m;
		for (let y = 0; y < m.length; y++) {
			for (let x = 0; x < m[y].length; x++) {
				if ( m[y][x] == 1 ) {
					if ( brick.y + y >= this.n_row || brick.x + x >= this.n_col || brick.x < 0 || brick.y < 0 ) {
						return false;
					}
				}
			}
		}
		return true;
	}

	/**
	 * Fuses the brick inside the board
	 * @params {Brick} brick
	 * @returns {boolean} 
	 */
	fuse( brick ) {
		let m = brick.m;
		for (let y = 0; y < m.length; y++) {
			for (let x = 0; x < m[y].length; x++) {
				if ( m[y][x] == 1 ) {
					if ( brick.y + y < this.n_row && brick.x + x < this.n_col && brick.x >= 0 && brick.y >= 0 ) {
						this.m[y + brick.y][x + brick.x] = 1;
					}
				}
			}
		}
	}

	/**
	 * Checks if the current brick collides with something or is at the bottom
	 * @params {Brick} brick
	 * @returns {boolean} 
	 */
	collidesWith( brick ) {
		let m = brick.m;
		for (let y = 0; y < m.length; y++) {
			for (let x = 0; x < m[y].length; x++) {
				if ( brick.y + y < this.n_row && brick.x + x < this.n_col && brick.x >= 0 && brick.y >= 0 )
					if ( m[y][x] == this.m[y + brick.y][x + brick.x] && m[y][x] == 1 ) {
						return true;
					}
			}
		}

		if ( brick.y + brick.m.length > this.n_row) 
			return true;
		return false;
	}


	/**
	 * Retracts the board starting from the given position
	 * @params {number} pos
	 */
	retract (pos) {
		const m = this.m;
		for (let y = pos; y >= 0; y--) {
			for (let x = 0; x < m[y].length; x++) {
				m[y + 1][x] = m[y][x];
			}
		}
	}

	/**
	 * Reduces the board by retracting
	 */
	checkAndReduce() {
		let reduced = 0;
		const m = this.m;
		for (let y = m.length - 1; y >= 0; y--) {
			let count = 0;
			for (let x = 0; x < m[y].length; x++) {
				count += m[y][x];
			}
			if ( y - 1 >= 0 && count == this.n_col ) {
				this.retract(y - 1);
				reduced++;
			}
		}
		return reduced;
	}

	/**
	 * Checks if the current game is over when a new brick pops up
	 */
	checkGameOver( brick ) {
		if ( this.collidesWith(brick) && brick.y <= 0)
			return true;
		return false;
	}
}