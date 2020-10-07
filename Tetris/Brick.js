class Brick {

	/**
	 * @constructor
	 * Constructs a new brick
	 */	
	constructor( matrix ) {
		this.x = 0;
		this.y = 0;
		this.m = matrix || [];
	}

	/**
	 * Creates a rotated brick ( transpose + reverse each row of the current brick)
	 * @returns {Brick}
	 */
	rotate() {
		const m = this.m;
		let transpose = new Array(m[0].length);
		for (let x = 0; x < m[0].length; x++) {
			transpose[x] = new Array(m.length);
			for (let y = 0; y < m.length; y++) {
				// transpose[x][y] = m[y][x];
				transpose[x][y] = m[m.length - y - 1][x];
			}
		}

		// let result = transpose.map( row => row.reverse() );
		let result = transpose;
		let brick = new Brick(result);
		brick.x = this.x;
		brick.y = this.y;
		return brick;
	}
}