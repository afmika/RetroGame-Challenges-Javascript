class Game {
    /**
     * @type {Board}
     */
    board;

    /**
     * @type {number}
     */
    dim;

    constructor (dim) {
        this.dim = dim;
        this.init ();
    }

    init () {
        this.board = new Board (this.dim);
    }
}